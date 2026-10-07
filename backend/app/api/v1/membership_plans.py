from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db, require_admin
from app.schemas.common import Page
from app.schemas.membership_plan import (
    MembershipPlanCreate,
    MembershipPlanRead,
    MembershipPlanUpdate,
)
from app.services import membership_plan_service

router = APIRouter(prefix="/membership-plans", tags=["membership-plans"])


@router.get("", response_model=Page[MembershipPlanRead])
def list_plans(
    pagination: Pagination = Depends(),
    active_only: bool = False,
    db: Session = Depends(get_db),
) -> Page[MembershipPlanRead]:
    items, total = membership_plan_service.list_plans(
        db, page=pagination.page, size=pagination.size, active_only=active_only
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=MembershipPlanRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_plan(data: MembershipPlanCreate, db: Session = Depends(get_db)) -> MembershipPlanRead:
    return membership_plan_service.create_plan(db, data)


@router.get("/{plan_id}", response_model=MembershipPlanRead)
def get_plan(plan_id: int, db: Session = Depends(get_db)) -> MembershipPlanRead:
    return membership_plan_service.get_plan(db, plan_id)


@router.put("/{plan_id}", response_model=MembershipPlanRead, dependencies=[Depends(require_admin)])
def update_plan(
    plan_id: int, data: MembershipPlanUpdate, db: Session = Depends(get_db)
) -> MembershipPlanRead:
    return membership_plan_service.update_plan(db, plan_id, data)


@router.delete(
    "/{plan_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)]
)
def delete_plan(plan_id: int, db: Session = Depends(get_db)) -> None:
    membership_plan_service.delete_plan(db, plan_id)
