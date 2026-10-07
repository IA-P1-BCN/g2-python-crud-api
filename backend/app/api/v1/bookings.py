from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    Pagination,
    build_page,
    get_current_user,
    get_db,
    require_member_or_admin,
    require_staff,
)
from app.models.booking import BookingStatus
from app.schemas.booking import BookingCreate, BookingRead
from app.schemas.common import Page
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=Page[BookingRead], dependencies=[Depends(require_staff)])
def list_bookings(
    pagination: Pagination = Depends(),
    member_id: int | None = None,
    schedule_id: int | None = None,
    status_filter: BookingStatus | None = None,
    on_date: date | None = None,
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    items, total = booking_service.list_bookings(
        db,
        page=pagination.page,
        size=pagination.size,
        member_id=member_id,
        schedule_id=schedule_id,
        status=status_filter,
        on_date=on_date,
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=BookingRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_member_or_admin)],
)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)) -> BookingRead:
    return booking_service.create_booking(db, data)


@router.get("/{booking_id}", response_model=BookingRead, dependencies=[Depends(get_current_user)])
def get_booking(booking_id: int, db: Session = Depends(get_db)) -> BookingRead:
    return booking_service.get_booking(db, booking_id)


@router.delete(
    "/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_member_or_admin)],
)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)) -> None:
    booking_service.cancel_booking(db, booking_id)
