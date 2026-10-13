from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDataError, NotFoundError
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate
from app.services import membership_service, user_service


def list_payments(
    db: Session,
    *,
    page: int,
    size: int,
    status: PaymentStatus | None = None,
    user_id: int | None = None,
) -> tuple[list[Payment], int]:
    stmt = select(Payment)
    count_stmt = select(func.count()).select_from(Payment)
    if status is not None:
        stmt = stmt.where(Payment.status == status)
        count_stmt = count_stmt.where(Payment.status == status)
    if user_id is not None:
        stmt = stmt.where(Payment.user_id == user_id)
        count_stmt = count_stmt.where(Payment.user_id == user_id)
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(Payment.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_payment(db: Session, payment_id: int) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise NotFoundError(f"Pago {payment_id} no encontrado")
    return payment


def get_last_for_users(db: Session, user_ids: list[int]) -> dict[int, Payment]:
    """The most recent payment of each user that has any."""
    stmt = (
        select(Payment)
        .where(Payment.user_id.in_(user_ids))
        .order_by(Payment.created_at.desc(), Payment.id.desc())
    )
    last: dict[int, Payment] = {}
    for payment in db.execute(stmt).scalars():
        last.setdefault(payment.user_id, payment)
    return last


def create_payment(db: Session, data: PaymentCreate) -> Payment:
    user_service.get_user(db, data.user_id)
    membership = membership_service.get_membership(db, data.membership_id)
    if membership.user_id != data.user_id:
        raise InvalidDataError("La membresía no pertenece a ese usuario")
    payment = Payment(**data.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def update_payment(db: Session, payment_id: int, data: PaymentUpdate) -> Payment:
    payment = get_payment(db, payment_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)
    db.commit()
    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment_id: int) -> None:
    payment = get_payment(db, payment_id)
    db.delete(payment)
    db.commit()
