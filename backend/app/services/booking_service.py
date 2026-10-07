from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError, NotFoundError
from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.schemas.booking import BookingCreate
from app.schemas.class_schedule import ScheduleAvailability
from app.services import class_schedule_service, membership_service, user_service


def list_bookings(
    db: Session,
    *,
    page: int,
    size: int,
    member_id: int | None = None,
    schedule_id: int | None = None,
    status: BookingStatus | None = None,
    on_date: date | None = None,
    trainer_id: int | None = None,
) -> tuple[list[Booking], int]:
    stmt = select(Booking)
    count_stmt = select(func.count()).select_from(Booking)
    filters = []
    if member_id is not None:
        filters.append(Booking.member_id == member_id)
    if schedule_id is not None:
        filters.append(Booking.schedule_id == schedule_id)
    if status is not None:
        filters.append(Booking.status == status)
    if on_date is not None:
        filters.append(Booking.booking_date == on_date)
    if trainer_id is not None:
        own_schedules = (
            select(ClassSchedule.id)
            .join(GymClass, ClassSchedule.class_id == GymClass.id)
            .where(GymClass.trainer_id == trainer_id)
        )
        filters.append(Booking.schedule_id.in_(own_schedules))
    if filters:
        stmt = stmt.where(*filters)
        count_stmt = count_stmt.where(*filters)
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(Booking.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_booking(db: Session, booking_id: int) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundError(f"Reserva {booking_id} no encontrada")
    return booking


def count_confirmed(db: Session, schedule_id: int, on_date: date) -> int:
    """Spots taken in a session; cancelled bookings free their spot."""
    return db.execute(
        select(func.count())
        .select_from(Booking)
        .where(
            Booking.schedule_id == schedule_id,
            Booking.booking_date == on_date,
            Booking.status == BookingStatus.confirmed,
        )
    ).scalar_one()


def get_availability(db: Session, schedule_id: int, on_date: date) -> ScheduleAvailability:
    schedule = class_schedule_service.get_schedule(db, schedule_id)
    capacity = schedule.gym_class.capacity
    booked = count_confirmed(db, schedule_id, on_date)
    return ScheduleAvailability(
        schedule_id=schedule_id,
        on_date=on_date,
        capacity=capacity,
        booked=booked,
        available=max(capacity - booked, 0),
    )


def create_booking(db: Session, data: BookingCreate) -> Booking:
    user_service.get_user(db, data.member_id)
    schedule = class_schedule_service.get_schedule(db, data.schedule_id)
    gym_class = schedule.gym_class

    if membership_service.get_active_for_user(db, data.member_id, data.booking_date) is None:
        raise BusinessRuleError("El socio no tiene una membresía activa en esa fecha")

    if count_confirmed(db, schedule.id, data.booking_date) >= gym_class.capacity:
        raise ConflictError("No quedan plazas para esa clase")

    same_day = db.execute(
        select(Booking).where(
            Booking.member_id == data.member_id,
            Booking.booking_date == data.booking_date,
            Booking.status == BookingStatus.confirmed,
        )
    ).scalars()
    for other in same_day:
        other_schedule = other.schedule
        if (
            schedule.start_time < other_schedule.end_time
            and other_schedule.start_time < schedule.end_time
        ):
            raise ConflictError("El socio ya tiene una reserva en ese horario")

    booking = Booking(
        member_id=data.member_id,
        schedule_id=data.schedule_id,
        booking_date=data.booking_date,
        status=BookingStatus.confirmed,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def cancel_booking(db: Session, booking_id: int) -> Booking:
    booking = get_booking(db, booking_id)
    if booking.status == BookingStatus.cancelled:
        raise ConflictError("La reserva ya estaba cancelada")
    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)
    return booking


def delete_booking(db: Session, booking_id: int) -> None:
    booking = get_booking(db, booking_id)
    db.delete(booking)
    db.commit()
