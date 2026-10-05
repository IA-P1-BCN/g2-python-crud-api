from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db
from app.schemas.booking import BookingRead
from app.schemas.class_schedule import (
    ClassScheduleCreate,
    ClassScheduleRead,
    ClassScheduleUpdate,
)
from app.schemas.common import Page
from app.services import booking_service, class_schedule_service

router = APIRouter(prefix="/class-schedules", tags=["class-schedules"])


@router.get("", response_model=Page[ClassScheduleRead])
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


@router.post("", response_model=ClassScheduleRead, status_code=status.HTTP_201_CREATED)
def create_schedule(
    data: ClassScheduleCreate, db: Session = Depends(get_db)
) -> ClassScheduleRead:
    return class_schedule_service.create_schedule(db, data)


@router.get("/{schedule_id}", response_model=ClassScheduleRead)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)) -> ClassScheduleRead:
    return class_schedule_service.get_schedule(db, schedule_id)


@router.put("/{schedule_id}", response_model=ClassScheduleRead)
def update_schedule(
    schedule_id: int, data: ClassScheduleUpdate, db: Session = Depends(get_db)
) -> ClassScheduleRead:
    return class_schedule_service.update_schedule(db, schedule_id, data)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)) -> None:
    class_schedule_service.delete_schedule(db, schedule_id)


@router.get("/{schedule_id}/bookings", response_model=Page[BookingRead])
def list_schedule_bookings(
    schedule_id: int,
    pagination: Pagination = Depends(),
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    class_schedule_service.get_schedule(db, schedule_id)
    items, total = booking_service.list_bookings(
        db, page=pagination.page, size=pagination.size, schedule_id=schedule_id
    )
    return build_page(items, total, pagination)
