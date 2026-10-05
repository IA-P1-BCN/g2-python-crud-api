from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.class_schedule import ClassSchedule
from app.schemas.class_schedule import ClassScheduleCreate, ClassScheduleUpdate
from app.services import class_service, room_service


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


def _check_room_overlap(
    db: Session,
    *,
    room_id: int,
    day_of_week: int,
    start_time,
    end_time,
    exclude_id: int | None = None,
) -> None:
    stmt = select(ClassSchedule).where(
        ClassSchedule.room_id == room_id,
        ClassSchedule.day_of_week == day_of_week,
    )
    for other in db.execute(stmt).scalars().all():
        if exclude_id is not None and other.id == exclude_id:
            continue
        if start_time < other.end_time and other.start_time < end_time:
            raise ConflictError("El aula ya está ocupada en ese horario")


def create_schedule(db: Session, data: ClassScheduleCreate) -> ClassSchedule:
    class_service.get_class(db, data.class_id)
    if data.room_id is not None:
        room_service.get_room(db, data.room_id)
        _check_room_overlap(
            db,
            room_id=data.room_id,
            day_of_week=data.day_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
        )
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

    class_service.get_class(db, class_id)
    if start_time >= end_time:
        raise ConflictError("start_time debe ser anterior a end_time")
    if room_id is not None:
        room_service.get_room(db, room_id)
        _check_room_overlap(
            db,
            room_id=room_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            exclude_id=schedule_id,
        )

    for field, value in payload.items():
        setattr(schedule, field, value)
    db.commit()
    db.refresh(schedule)
    return schedule


def delete_schedule(db: Session, schedule_id: int) -> None:
    schedule = get_schedule(db, schedule_id)
    db.delete(schedule)
    db.commit()
