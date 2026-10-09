from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.user import UserRole
from app.schemas.gym_class import GymClassCreate, GymClassUpdate
from app.services import room_service, user_service
from app.services.dependents import ensure_no_dependents


def list_classes(
    db: Session,
    *,
    page: int,
    size: int,
    trainer_id: int | None = None,
    active_only: bool = False,
) -> tuple[list[GymClass], int]:
    stmt = select(GymClass)
    count_stmt = select(func.count()).select_from(GymClass)
    if trainer_id is not None:
        stmt = stmt.where(GymClass.trainer_id == trainer_id)
        count_stmt = count_stmt.where(GymClass.trainer_id == trainer_id)
    if active_only:
        stmt = stmt.where(GymClass.is_active.is_(True))
        count_stmt = count_stmt.where(GymClass.is_active.is_(True))
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(GymClass.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_class(db: Session, class_id: int) -> GymClass:
    gym_class = db.get(GymClass, class_id)
    if gym_class is None:
        raise NotFoundError(f"Clase {class_id} no encontrada")
    return gym_class


def _validate_trainer(db: Session, trainer_id: int) -> None:
    trainer = user_service.get_user(db, trainer_id)
    if trainer.role != UserRole.trainer:
        raise BusinessRuleError("trainer_id debe corresponder a un entrenador")


def create_class(db: Session, data: GymClassCreate) -> GymClass:
    _validate_trainer(db, data.trainer_id)
    if data.room_id is not None:
        room_service.get_room(db, data.room_id)
    gym_class = GymClass(**data.model_dump())
    db.add(gym_class)
    db.commit()
    db.refresh(gym_class)
    return gym_class


def update_class(db: Session, class_id: int, data: GymClassUpdate) -> GymClass:
    gym_class = get_class(db, class_id)
    payload = data.model_dump(exclude_unset=True)
    if payload.get("trainer_id") is not None:
        _validate_trainer(db, payload["trainer_id"])
    if payload.get("room_id") is not None:
        room_service.get_room(db, payload["room_id"])
    for field, value in payload.items():
        setattr(gym_class, field, value)
    db.commit()
    db.refresh(gym_class)
    return gym_class


def delete_class(db: Session, class_id: int) -> None:
    gym_class = get_class(db, class_id)
    ensure_no_dependents(
        db,
        ClassSchedule.class_id,
        class_id,
        "No se puede borrar una clase con horarios; borra antes sus horarios",
    )
    db.delete(gym_class)
    db.commit()
