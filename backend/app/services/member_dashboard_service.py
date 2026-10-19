"""What a member sees on their home screen, built for the logged-in user only."""

from datetime import date, datetime

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, aliased

from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership_plan import MembershipPlan
from app.models.room import Room
from app.models.user import User
from app.schemas.member_dashboard import (
    CurrentMembership,
    MemberDashboard,
    MemberStats,
    UpcomingBooking,
)
from app.services import membership_service

UPCOMING_LIMIT = 5


def get_dashboard(db: Session, user: User, now: datetime | None = None) -> MemberDashboard:
    now = now or datetime.now()
    return MemberDashboard(
        membership=_current_membership(db, user.id, now.date()),
        upcoming_bookings=_upcoming_bookings(db, user.id, now),
        stats=_stats(db, user.id, now.date()),
    )


def _current_membership(db: Session, user_id: int, today: date) -> CurrentMembership | None:
    membership = membership_service.get_active_for_user(db, user_id, today)
    if membership is None:
        return None
    plan = db.get(MembershipPlan, membership.plan_id)
    return CurrentMembership(
        membership_id=membership.id,
        plan_id=membership.plan_id,
        plan_name=plan.name,
        start_date=membership.start_date,
        end_date=membership.end_date,
        status=membership_service.compute_status(
            membership.start_date, membership.end_date, today=today
        ),
        days_left=(membership.end_date - today).days,
    )


def _upcoming_bookings(db: Session, user_id: int, now: datetime) -> list[UpcomingBooking]:
    """Confirmed bookings from now on: later days, or today if the session has not started."""
    trainer = aliased(User)
    rows = db.execute(
        select(Booking, ClassSchedule, GymClass, Room.name, trainer.full_name)
        .join(ClassSchedule, Booking.schedule_id == ClassSchedule.id)
        .join(GymClass, ClassSchedule.class_id == GymClass.id)
        .join(trainer, GymClass.trainer_id == trainer.id)
        .outerjoin(Room, ClassSchedule.room_id == Room.id)
        .where(
            Booking.member_id == user_id,
            Booking.status == BookingStatus.confirmed,
            or_(
                Booking.booking_date > now.date(),
                and_(
                    Booking.booking_date == now.date(),
                    ClassSchedule.start_time >= now.time(),
                ),
            ),
        )
        .order_by(Booking.booking_date, ClassSchedule.start_time, Booking.id)
        .limit(UPCOMING_LIMIT)
    ).all()
    return [
        UpcomingBooking(
            booking_id=booking.id,
            booking_date=booking.booking_date,
            schedule_id=schedule.id,
            class_id=gym_class.id,
            class_name=gym_class.name,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            room_name=room_name,
            trainer_name=trainer_name,
        )
        for booking, schedule, gym_class, room_name, trainer_name in rows
    ]


def _count_confirmed(db: Session, user_id: int, *conditions) -> int:
    return db.execute(
        select(func.count())
        .select_from(Booking)
        .where(
            Booking.member_id == user_id,
            Booking.status == BookingStatus.confirmed,
            *conditions,
        )
    ).scalar_one()


def _stats(db: Session, user_id: int, today: date) -> MemberStats:
    first_of_month = today.replace(day=1)
    first_of_next = (
        first_of_month.replace(year=today.year + 1, month=1)
        if today.month == 12
        else first_of_month.replace(month=today.month + 1)
    )
    return MemberStats(
        bookings_this_month=_count_confirmed(
            db,
            user_id,
            Booking.booking_date >= first_of_month,
            Booking.booking_date < first_of_next,
        ),
        total_bookings=_count_confirmed(db, user_id),
    )
