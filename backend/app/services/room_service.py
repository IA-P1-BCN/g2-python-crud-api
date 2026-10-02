from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate


def list_rooms(db: Session, *, page: int, size: int) -> tuple[list[Room], int]:
    total = db.execute(select(func.count()).select_from(Room)).scalar_one()
    stmt = select(Room).order_by(Room.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_room(db: Session, room_id: int) -> Room:
    room = db.get(Room, room_id)
    if room is None:
        raise NotFoundError(f"Aula {room_id} no encontrada")
    return room


def create_room(db: Session, data: RoomCreate) -> Room:
    existing = db.execute(select(Room).where(Room.name == data.name)).scalar_one_or_none()
    if existing is not None:
        raise ConflictError("Ya existe un aula con ese nombre")
    room = Room(**data.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def update_room(db: Session, room_id: int, data: RoomUpdate) -> Room:
    room = get_room(db, room_id)
    payload = data.model_dump(exclude_unset=True)
    if "name" in payload:
        duplicate = db.execute(
            select(Room).where(Room.name == payload["name"], Room.id != room_id)
        ).scalar_one_or_none()
        if duplicate is not None:
            raise ConflictError("Ya existe un aula con ese nombre")
    for field, value in payload.items():
        setattr(room, field, value)
    db.commit()
    db.refresh(room)
    return room


def delete_room(db: Session, room_id: int) -> None:
    room = get_room(db, room_id)
    db.delete(room)
    db.commit()
