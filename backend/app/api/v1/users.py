from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    Pagination,
    build_page,
    get_current_user,
    get_db,
    require_admin,
    require_staff,
)
from app.models.user import User, UserRole
from app.schemas.booking import BookingRead
from app.schemas.common import Page
from app.schemas.membership import MembershipRead
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import access_service, booking_service, membership_service, user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=Page[UserRead])
def list_users(
    pagination: Pagination = Depends(),
    role: UserRole | None = None,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> Page[UserRead]:
    role = access_service.visible_user_role(current_user, role)
    items, total = user_service.list_users(
        db, page=pagination.page, size=pagination.size, role=role
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_user(data: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    return user_service.create_user(db, data)


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    access_service.ensure_self_or_admin(current_user, user_id)
    return user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserRead:
    if data.is_active is False:
        access_service.ensure_not_own_account(current_user, user_id)
    return user_service.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    """Sign a user off: the account is deactivated, never deleted, so its history is kept."""
    access_service.ensure_not_own_account(current_user, user_id)
    user_service.deactivate_user(db, user_id)


@router.get("/{user_id}/memberships", response_model=Page[MembershipRead])
def list_user_memberships(
    user_id: int,
    pagination: Pagination = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Page[MembershipRead]:
    access_service.ensure_self_or_admin(current_user, user_id)
    user_service.get_user(db, user_id)
    items, total = membership_service.list_memberships(
        db, page=pagination.page, size=pagination.size, user_id=user_id
    )
    return build_page(items, total, pagination)


@router.get("/{user_id}/bookings", response_model=Page[BookingRead])
def list_user_bookings(
    user_id: int,
    pagination: Pagination = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    access_service.ensure_self_or_admin(current_user, user_id)
    user_service.get_user(db, user_id)
    items, total = booking_service.list_bookings(
        db, page=pagination.page, size=pagination.size, member_id=user_id
    )
    return build_page(items, total, pagination)
