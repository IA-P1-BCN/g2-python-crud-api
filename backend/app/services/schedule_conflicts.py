"""Weekly slots that cannot overlap: a room holds one session at a time, and so does a trainer."""

from datetime import time

from sqlalchemy import ColumnElement, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass


def _ensure_no_overlap(
    db: Session,
    *conditions: ColumnElement[bool],
    day_of_week: int,
    start_time: time,
    end_time: time,
    message: str,
) -> None:
    """Raise a conflict if a schedule matching `conditions` overlaps the slot that day."""
    overlapping = db.execute(
        select(ClassSchedule.id)
        .where(
            *conditions,
            ClassSchedule.day_of_week == day_of_week,
            ClassSchedule.start_time < end_time,
            ClassSchedule.end_time > start_time,
        )
        .limit(1)
    ).first()
    if overlapping is not None:
        raise ConflictError(message)


def ensure_room_is_free(
    db: Session,
    room_id: int,
    *,
    day_of_week: int,
    start_time: time,
    end_time: time,
    exclude_schedule_id: int | None = None,
) -> None:
    conditions = [ClassSchedule.room_id == room_id]
    if exclude_schedule_id is not None:
        conditions.append(ClassSchedule.id != exclude_schedule_id)
    _ensure_no_overlap(
        db,
        *conditions,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
        message="El aula ya está ocupada en ese horario",
    )


def ensure_trainer_is_free(
    db: Session,
    trainer_id: int,
    *,
    day_of_week: int,
    start_time: time,
    end_time: time,
    exclude_schedule_id: int | None = None,
    exclude_class_id: int | None = None,
) -> None:
    """A trainer cannot teach two sessions at once, whatever the room.

    `exclude_class_id` leaves out the schedules of a class that is changing trainer.
    """
    taught_by_trainer = select(GymClass.id).where(GymClass.trainer_id == trainer_id)
    conditions = [ClassSchedule.class_id.in_(taught_by_trainer)]
    if exclude_schedule_id is not None:
        conditions.append(ClassSchedule.id != exclude_schedule_id)
    if exclude_class_id is not None:
        conditions.append(ClassSchedule.class_id != exclude_class_id)
    _ensure_no_overlap(
        db,
        *conditions,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
        message="El entrenador ya tiene otra clase en ese horario",
    )
