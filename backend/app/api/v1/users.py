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
from app.models.user import UserRole
from app.schemas.booking import BookingRead
from app.schemas.common import Page
from app.schemas.membership import MembershipRead
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import booking_service, membership_service, user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=Page[UserRead], dependencies=[Depends(require_staff)])
def list_users(
    pagination: Pagination = Depends(),
    role: UserRole | None = None,
    db: Session = Depends(get_db),
) -> Page[UserRead]:
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


@router.get("/{user_id}", response_model=UserRead, dependencies=[Depends(get_current_user)])
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserRead:
    return user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserRead, dependencies=[Depends(require_admin)])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)) -> UserRead:
    return user_service.update_user(db, user_id, data)


@router.delete(
    "/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)]
)
def delete_user(user_id: int, db: Session = Depends(get_db)) -> None:
    user_service.delete_user(db, user_id)


@router.get(
    "/{user_id}/memberships",
    response_model=Page[MembershipRead],
    dependencies=[Depends(get_current_user)],
)
def list_user_memberships(
    user_id: int,
    pagination: Pagination = Depends(),
    db: Session = Depends(get_db),
) -> Page[MembershipRead]:
    user_service.get_user(db, user_id)
    items, total = membership_service.list_memberships(
        db, page=pagination.page, size=pagination.size, user_id=user_id
    )
    return build_page(items, total, pagination)


@router.get(
    "/{user_id}/bookings",
    response_model=Page[BookingRead],
    dependencies=[Depends(get_current_user)],
)
def list_user_bookings(
    user_id: int,
    pagination: Pagination = Depends(),
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    user_service.get_user(db, user_id)
    items, total = booking_service.list_bookings(
        db, page=pagination.page, size=pagination.size, member_id=user_id
    )
    return build_page(items, total, pagination)
