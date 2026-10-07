from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_current_user, get_db, require_admin
from app.models.membership import MembershipStatus
from app.models.user import User
from app.schemas.common import Page
from app.schemas.membership import MembershipCreate, MembershipRead, MembershipUpdate
from app.services import access_service, membership_service

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("", response_model=Page[MembershipRead], dependencies=[Depends(require_admin)])
def list_memberships(
    pagination: Pagination = Depends(),
    status_filter: MembershipStatus | None = None,
    user_id: int | None = None,
    db: Session = Depends(get_db),
) -> Page[MembershipRead]:
    items, total = membership_service.list_memberships(
        db,
        page=pagination.page,
        size=pagination.size,
        status=status_filter,
        user_id=user_id,
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=MembershipRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_membership(data: MembershipCreate, db: Session = Depends(get_db)) -> MembershipRead:
    return membership_service.create_membership(db, data)


@router.get("/{membership_id}", response_model=MembershipRead)
def get_membership(
    membership_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MembershipRead:
    membership = membership_service.get_membership(db, membership_id)
    access_service.ensure_self_or_admin(current_user, membership.user_id)
    return membership


@router.put(
    "/{membership_id}", response_model=MembershipRead, dependencies=[Depends(require_admin)]
)
def update_membership(
    membership_id: int, data: MembershipUpdate, db: Session = Depends(get_db)
) -> MembershipRead:
    return membership_service.update_membership(db, membership_id, data)


@router.delete(
    "/{membership_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_membership(membership_id: int, db: Session = Depends(get_db)) -> None:
    membership_service.delete_membership(db, membership_id)
