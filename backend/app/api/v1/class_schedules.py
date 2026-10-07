from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db, require_staff
from app.models.user import User
from app.schemas.booking import BookingRead
from app.schemas.class_schedule import (
    ClassScheduleCreate,
    ClassScheduleRead,
    ClassScheduleUpdate,
    ScheduleAvailability,
)
from app.schemas.common import Page
from app.services import (
    access_service,
    booking_service,
    class_schedule_service,
    class_service,
)

router = APIRouter(prefix="/class-schedules", tags=["class-schedules"])


@router.get(
    "",
    response_model=Page[ClassScheduleRead],
    summary="Listar horarios",
    description=(
        "Lista los horarios semanales. Se puede filtrar por `class_id` "
        "y `day_of_week` (0 = lunes, 6 = domingo)."
    ),
)
def list_schedules(
    pagination: Pagination = Depends(),
    class_id: int | None = None,
    day_of_week: int | None = None,
    db: Session = Depends(get_db),
) -> Page[ClassScheduleRead]:
    items, total = class_schedule_service.list_schedules(
        db,
        page=pagination.page,
        size=pagination.size,
        class_id=class_id,
        day_of_week=day_of_week,
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=ClassScheduleRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear horario",
    description="Crea un horario semanal para una clase. Requiere rol administrador o entrenador.",
)
def create_schedule(
    data: ClassScheduleCreate,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> ClassScheduleRead:
    access_service.ensure_can_manage_class(current_user, class_service.get_class(db, data.class_id))
    return class_schedule_service.create_schedule(db, data)


@router.get(
    "/{schedule_id}",
    response_model=ClassScheduleRead,
    summary="Obtener horario",
    description="Devuelve un horario por id.",
)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)) -> ClassScheduleRead:
    return class_schedule_service.get_schedule(db, schedule_id)


@router.get("/{schedule_id}/availability", response_model=ScheduleAvailability)
def get_schedule_availability(
    schedule_id: int, on_date: date, db: Session = Depends(get_db)
) -> ScheduleAvailability:
    """Capacity, booked and free spots of the schedule on a date. Public, like the schedules."""
    return booking_service.get_availability(db, schedule_id, on_date)


@router.put("/{schedule_id}", response_model=ClassScheduleRead)
def update_schedule(
    schedule_id: int,
    data: ClassScheduleUpdate,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> ClassScheduleRead:
    schedule = class_schedule_service.get_schedule(db, schedule_id)
    access_service.ensure_can_manage_class(current_user, schedule.gym_class)
    if data.class_id is not None:
        # Moving the schedule to another class needs rights over that class too.
        target_class = class_service.get_class(db, data.class_id)
        access_service.ensure_can_manage_class(current_user, target_class)
    return class_schedule_service.update_schedule(db, schedule_id, data)


@router.delete(
    "/{schedule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar horario",
    description="Elimina un horario. Requiere rol administrador o ser el entrenador de la clase.",
)
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> None:
    schedule = class_schedule_service.get_schedule(db, schedule_id)
    access_service.ensure_can_manage_class(current_user, schedule.gym_class)
    class_schedule_service.delete_schedule(db, schedule_id)


@router.get(
    "/{schedule_id}/bookings",
    response_model=Page[BookingRead],
    summary="Reservas de un horario",
    description="Lista las reservas de un horario. Requiere rol administrador o entrenador.",
)
def list_schedule_bookings(
    schedule_id: int,
    pagination: Pagination = Depends(),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    schedule = class_schedule_service.get_schedule(db, schedule_id)
    access_service.ensure_can_manage_class(current_user, schedule.gym_class)
    items, total = booking_service.list_bookings(
        db, page=pagination.page, size=pagination.size, schedule_id=schedule_id
    )
    return build_page(items, total, pagination)
