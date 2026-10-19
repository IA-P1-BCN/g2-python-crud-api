from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDataError, NotFoundError
from app.models.booking import Booking
from app.models.class_schedule import ClassSchedule
from app.schemas.class_schedule import ClassScheduleCreate, ClassScheduleUpdate
from app.services import class_service, room_service
from app.services.dependents import ensure_no_dependents
from app.services.schedule_conflicts import ensure_room_is_free, ensure_trainer_is_free


def list_schedules(
    db: Session,
    *,
    page: int,
    size: int,
    class_id: int | None = None,
    day_of_week: int | None = None,
) -> tuple[list[ClassSchedule], int]:
    stmt = select(ClassSchedule)
    count_stmt = select(func.count()).select_from(ClassSchedule)
    if class_id is not None:
        stmt = stmt.where(ClassSchedule.class_id == class_id)
        count_stmt = count_stmt.where(ClassSchedule.class_id == class_id)
    if day_of_week is not None:
        stmt = stmt.where(ClassSchedule.day_of_week == day_of_week)
        count_stmt = count_stmt.where(ClassSchedule.day_of_week == day_of_week)
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(ClassSchedule.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_schedule(db: Session, schedule_id: int) -> ClassSchedule:
    schedule = db.get(ClassSchedule, schedule_id)
    if schedule is None:
        raise NotFoundError(f"Horario {schedule_id} no encontrado")
    return schedule


def create_schedule(db: Session, data: ClassScheduleCreate) -> ClassSchedule:
    gym_class = class_service.get_class(db, data.class_id)
    room_service.get_room(db, data.room_id)
    slot = {
        "day_of_week": data.day_of_week,
        "start_time": data.start_time,
        "end_time": data.end_time,
    }
    ensure_room_is_free(db, data.room_id, **slot)
    ensure_trainer_is_free(db, gym_class.trainer_id, **slot)
    schedule = ClassSchedule(**data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


def update_schedule(
    db: Session, schedule_id: int, data: ClassScheduleUpdate
) -> ClassSchedule:
    schedule = get_schedule(db, schedule_id)
    payload = data.model_dump(exclude_unset=True)
    class_id = payload.get("class_id", schedule.class_id)
    room_id = payload.get("room_id", schedule.room_id)
    day_of_week = payload.get("day_of_week", schedule.day_of_week)
    start_time = payload.get("start_time", schedule.start_time)
    end_time = payload.get("end_time", schedule.end_time)

    gym_class = class_service.get_class(db, class_id)
    if start_time >= end_time:
        raise InvalidDataError("start_time debe ser anterior a end_time")
    slot = {
        "day_of_week": day_of_week,
        "start_time": start_time,
        "end_time": end_time,
        "exclude_schedule_id": schedule_id,
    }
    if room_id is not None:
        room_service.get_room(db, room_id)
        ensure_room_is_free(db, room_id, **slot)
    ensure_trainer_is_free(db, gym_class.trainer_id, **slot)

    for field, value in payload.items():
        setattr(schedule, field, value)
    db.commit()
    db.refresh(schedule)
    return schedule


def delete_schedule(db: Session, schedule_id: int) -> None:
    schedule = get_schedule(db, schedule_id)
    ensure_no_dependents(
        db, Booking.schedule_id, schedule_id, "No se puede borrar un horario con reservas"
    )
    db.delete(schedule)
    db.commit()
