from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db
from app.models.payment import PaymentStatus
from app.schemas.common import Page
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=Page[PaymentRead])
def list_payments(
    pagination: Pagination = Depends(),
    status_filter: PaymentStatus | None = None,
    user_id: int | None = None,
    db: Session = Depends(get_db),
) -> Page[PaymentRead]:
    items, total = payment_service.list_payments(
        db,
        page=pagination.page,
        size=pagination.size,
        status=status_filter,
        user_id=user_id,
    )
    return build_page(items, total, pagination)


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)) -> PaymentRead:
    return payment_service.create_payment(db, data)


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(payment_id: int, db: Session = Depends(get_db)) -> PaymentRead:
    return payment_service.get_payment(db, payment_id)


@router.put("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: int, data: PaymentUpdate, db: Session = Depends(get_db)
) -> PaymentRead:
    return payment_service.update_payment(db, payment_id, data)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)) -> None:
    payment_service.delete_payment(db, payment_id)
