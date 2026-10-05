from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db
from app.schemas.class_schedule import ClassScheduleRead
from app.schemas.common import Page
from app.schemas.gym_class import GymClassCreate, GymClassRead, GymClassUpdate
from app.services import class_schedule_service, class_service

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("", response_model=Page[GymClassRead])
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


@router.post("", response_model=GymClassRead, status_code=status.HTTP_201_CREATED)
def create_class(data: GymClassCreate, db: Session = Depends(get_db)) -> GymClassRead:
    return class_service.create_class(db, data)


@router.get("/{class_id}", response_model=GymClassRead)
def get_class(class_id: int, db: Session = Depends(get_db)) -> GymClassRead:
    return class_service.get_class(db, class_id)


@router.put("/{class_id}", response_model=GymClassRead)
def update_class(
    class_id: int, data: GymClassUpdate, db: Session = Depends(get_db)
) -> GymClassRead:
    return class_service.update_class(db, class_id, data)


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(class_id: int, db: Session = Depends(get_db)) -> None:
    class_service.delete_class(db, class_id)


@router.get("/{class_id}/schedules", response_model=Page[ClassScheduleRead])
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
