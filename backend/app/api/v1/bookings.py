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
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead
from app.schemas.common import Page
from app.services import access_service, booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=Page[BookingRead])
def list_bookings(
    pagination: Pagination = Depends(),
    member_id: int | None = None,
    schedule_id: int | None = None,
    status_filter: BookingStatus | None = None,
    on_date: date | None = None,
    current_user: User = Depends(require_staff),
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
        trainer_id=access_service.bookings_trainer_scope(current_user),
    )
    return build_page(items, total, pagination)


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    current_user: User = Depends(require_member_or_admin),
    db: Session = Depends(get_db),
) -> BookingRead:
    access_service.ensure_self_or_admin(current_user, data.member_id)
    return booking_service.create_booking(db, data)


@router.get("/{booking_id}", response_model=BookingRead)
def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BookingRead:
    booking = booking_service.get_booking(db, booking_id)
    access_service.ensure_can_read_booking(current_user, booking)
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(require_member_or_admin),
    db: Session = Depends(get_db),
) -> None:
    booking = booking_service.get_booking(db, booking_id)
    access_service.ensure_self_or_admin(current_user, booking.member_id)
    booking_service.cancel_booking(db, booking_id)
