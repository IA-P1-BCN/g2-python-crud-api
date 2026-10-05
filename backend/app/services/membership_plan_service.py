from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.membership_plan import MembershipPlan
from app.schemas.membership_plan import MembershipPlanCreate, MembershipPlanUpdate


def list_plans(
    db: Session,
    *,
    page: int,
    size: int,
    active_only: bool = False,
) -> tuple[list[MembershipPlan], int]:
    stmt = select(MembershipPlan)
    count_stmt = select(func.count()).select_from(MembershipPlan)
    if active_only:
        stmt = stmt.where(MembershipPlan.is_active.is_(True))
        count_stmt = count_stmt.where(MembershipPlan.is_active.is_(True))
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(MembershipPlan.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_plan(db: Session, plan_id: int) -> MembershipPlan:
    plan = db.get(MembershipPlan, plan_id)
    if plan is None:
        raise NotFoundError(f"Plan {plan_id} no encontrado")
    return plan


def create_plan(db: Session, data: MembershipPlanCreate) -> MembershipPlan:
    existing = db.execute(
        select(MembershipPlan).where(MembershipPlan.name == data.name)
    ).scalar_one_or_none()
    if existing is not None:
        raise ConflictError("Ya existe un plan con ese nombre")
    plan = MembershipPlan(**data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def update_plan(db: Session, plan_id: int, data: MembershipPlanUpdate) -> MembershipPlan:
    plan = get_plan(db, plan_id)
    payload = data.model_dump(exclude_unset=True)
    if "name" in payload:
        duplicate = db.execute(
            select(MembershipPlan).where(
                MembershipPlan.name == payload["name"], MembershipPlan.id != plan_id
            )
        ).scalar_one_or_none()
        if duplicate is not None:
            raise ConflictError("Ya existe un plan con ese nombre")
    for field, value in payload.items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan


def delete_plan(db: Session, plan_id: int) -> None:
    plan = get_plan(db, plan_id)
    db.delete(plan)
    db.commit()
