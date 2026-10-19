from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_current_user, get_db, require_admin
from app.api.responses import errors
from app.schemas.common import Page
from app.schemas.room import RoomCreate, RoomRead, RoomUpdate
from app.services import room_service

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get(
    "",
    responses=errors(401, 422),
    response_model=Page[RoomRead],
    dependencies=[Depends(get_current_user)],
    summary="Listar salas",
    description="Lista las salas del gimnasio. Requiere sesión.",
)
def list_rooms(pagination: Pagination = Depends(), db: Session = Depends(get_db)) -> Page[RoomRead]:
    items, total = room_service.list_rooms(db, page=pagination.page, size=pagination.size)
    return build_page(items, total, pagination)


@router.post(
    "",
    responses=errors(401, 403, 409, 422),
    response_model=RoomRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Crear sala",
    description="Crea una sala. Requiere rol administrador.",
)
def create_room(data: RoomCreate, db: Session = Depends(get_db)) -> RoomRead:
    return room_service.create_room(db, data)


@router.get(
    "/{room_id}",
    responses=errors(401, 404, 422),
    response_model=RoomRead,
    dependencies=[Depends(get_current_user)],
    summary="Obtener sala",
    description="Devuelve una sala por id. Requiere sesión.",
)
def get_room(room_id: int, db: Session = Depends(get_db)) -> RoomRead:
    return room_service.get_room(db, room_id)


@router.put(
    "/{room_id}",
    responses=errors(401, 403, 404, 409, 422),
    response_model=RoomRead,
    dependencies=[Depends(require_admin)],
    summary="Actualizar sala",
    description="Actualiza una sala. Requiere rol administrador.",
)
def update_room(room_id: int, data: RoomUpdate, db: Session = Depends(get_db)) -> RoomRead:
    return room_service.update_room(db, room_id, data)


@router.delete(
    "/{room_id}",
    responses=errors(401, 403, 404, 409, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Eliminar sala",
    description="Elimina una sala. Requiere rol administrador.",
)
def delete_room(room_id: int, db: Session = Depends(get_db)) -> None:
    room_service.delete_room(db, room_id)
