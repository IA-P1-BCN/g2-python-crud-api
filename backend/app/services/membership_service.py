from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.membership import Membership, MembershipStatus
from app.models.payment import Payment
from app.schemas.membership import MembershipCreate, MembershipUpdate
from app.services import membership_plan_service, user_service
from app.services.dependents import ensure_no_dependents


def compute_status(
    start_date: date,
    end_date: date,
    *,
    today: date | None = None,
    cancelled: bool = False,
) -> MembershipStatus:
    """Deriva el estado de una membresía a partir de sus fechas."""
    if cancelled:
        return MembershipStatus.cancelled
    reference = today or date.today()
    if reference > end_date:
        return MembershipStatus.expired
    return MembershipStatus.active


def list_memberships(
    db: Session,
    *,
    page: int,
    size: int,
    status: MembershipStatus | None = None,
    user_id: int | None = None,
) -> tuple[list[Membership], int]:
    stmt = select(Membership)
    count_stmt = select(func.count()).select_from(Membership)
    if status is not None:
        stmt = stmt.where(Membership.status == status)
        count_stmt = count_stmt.where(Membership.status == status)
    if user_id is not None:
        stmt = stmt.where(Membership.user_id == user_id)
        count_stmt = count_stmt.where(Membership.user_id == user_id)
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(Membership.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_membership(db: Session, membership_id: int) -> Membership:
    membership = db.get(Membership, membership_id)
    if membership is None:
        raise NotFoundError(f"Membresía {membership_id} no encontrada")
    return membership


def create_membership(db: Session, data: MembershipCreate) -> Membership:
    user_service.get_user(db, data.user_id)
    plan = membership_plan_service.get_plan(db, data.plan_id)
    if not plan.is_active:
        raise BusinessRuleError("No se puede asignar un plan inactivo")

    end_date = data.start_date + timedelta(days=plan.duration_days)
    membership = Membership(
        user_id=data.user_id,
        plan_id=data.plan_id,
        start_date=data.start_date,
        end_date=end_date,
        status=compute_status(data.start_date, end_date),
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def update_membership(
    db: Session, membership_id: int, data: MembershipUpdate
) -> Membership:
    membership = get_membership(db, membership_id)
    payload = data.model_dump(exclude_unset=True)

    if "start_date" in payload:
        plan = membership_plan_service.get_plan(db, membership.plan_id)
        membership.start_date = payload["start_date"]
        membership.end_date = membership.start_date + timedelta(days=plan.duration_days)
        membership.status = compute_status(membership.start_date, membership.end_date)

    if payload.get("status") is not None:
        membership.status = payload["status"]

    db.commit()
    db.refresh(membership)
    return membership


def delete_membership(db: Session, membership_id: int) -> None:
    membership = get_membership(db, membership_id)
    ensure_no_dependents(
        db,
        Payment.membership_id,
        membership_id,
        "No se puede borrar una membresía con pagos; cancélala en su lugar",
    )
    db.delete(membership)
    db.commit()


def get_active_for_user(db: Session, user_id: int, on_date: date) -> Membership | None:
    """Devuelve la membresía vigente de un socio en una fecha, si existe."""
    stmt = (
        select(Membership)
        .where(
            Membership.user_id == user_id,
            Membership.status != MembershipStatus.cancelled,
            Membership.start_date <= on_date,
            Membership.end_date >= on_date,
        )
        .order_by(Membership.end_date.desc())
    )
    return db.execute(stmt).scalars().first()
