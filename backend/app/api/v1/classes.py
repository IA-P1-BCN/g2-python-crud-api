from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db, require_staff
from app.models.user import User
from app.schemas.class_schedule import ClassScheduleRead
from app.schemas.common import Page
from app.schemas.gym_class import GymClassCreate, GymClassRead, GymClassUpdate
from app.services import access_service, class_schedule_service, class_service

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get(
    "",
    response_model=Page[GymClassRead],
    summary="Listar clases",
    description=(
        "Lista las clases paginadas. Se puede filtrar por `trainer_id` y `active_only`. "
        "Un entrenador solo ve las suyas."
    ),
)
def list_classes(
    pagination: Pagination = Depends(),
    trainer_id: int | None = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
) -> Page[GymClassRead]:
    items, total = class_service.list_classes(
        db,
        page=pagination.page,
        size=pagination.size,
        trainer_id=trainer_id,
        active_only=active_only,
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=GymClassRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear clase",
    description="Crea una clase asignando un entrenador. Requiere rol administrador o entrenador.",
)
def create_class(
    data: GymClassCreate,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> GymClassRead:
    access_service.ensure_can_assign_trainer(current_user, data.trainer_id)
    return class_service.create_class(db, data)


@router.get(
    "/{class_id}",
    response_model=GymClassRead,
    summary="Obtener clase",
    description="Devuelve una clase por id.",
)
def get_class(class_id: int, db: Session = Depends(get_db)) -> GymClassRead:
    return class_service.get_class(db, class_id)


@router.put(
    "/{class_id}",
    response_model=GymClassRead,
    summary="Actualizar clase",
    description="Actualiza una clase. Requiere rol administrador o ser el entrenador asignado.",
)
def update_class(
    class_id: int,
    data: GymClassUpdate,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> GymClassRead:
    access_service.ensure_can_manage_class(current_user, class_service.get_class(db, class_id))
    access_service.ensure_can_assign_trainer(current_user, data.trainer_id)
    return class_service.update_class(db, class_id, data)


@router.delete(
    "/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar clase",
    description="Elimina una clase. Requiere rol administrador o ser el entrenador asignado.",
)
def delete_class(
    class_id: int,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> None:
    access_service.ensure_can_manage_class(current_user, class_service.get_class(db, class_id))
    class_service.delete_class(db, class_id)


@router.get(
    "/{class_id}/schedules",
    response_model=Page[ClassScheduleRead],
    summary="Horarios de una clase",
    description="Lista los horarios semanales de una clase.",
)
def list_class_schedules(
    class_id: int,
    pagination: Pagination = Depends(),
    db: Session = Depends(get_db),
) -> Page[ClassScheduleRead]:
    class_service.get_class(db, class_id)
    items, total = class_schedule_service.list_schedules(
        db, page=pagination.page, size=pagination.size, class_id=class_id
    )
    return build_page(items, total, pagination)
