from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db, require_admin
from app.models.payment import PaymentStatus
from app.schemas.common import Page
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"], dependencies=[Depends(require_admin)])


@router.get(
    "",
    response_model=Page[PaymentRead],
    summary="Listar pagos",
    description=(
        "Lista los pagos paginados. Filtros: `status_filter` y `user_id`. "
        "Requiere rol administrador."
    ),
)
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


@router.post(
    "",
    response_model=PaymentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear pago",
    description="Registra un pago asociado a una membresía. Requiere rol administrador.",
)
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)) -> PaymentRead:
    return payment_service.create_payment(db, data)


@router.get(
    "/{payment_id}",
    response_model=PaymentRead,
    summary="Obtener pago",
    description="Devuelve un pago por id. Requiere rol administrador.",
)
def get_payment(payment_id: int, db: Session = Depends(get_db)) -> PaymentRead:
    return payment_service.get_payment(db, payment_id)


@router.put(
    "/{payment_id}",
    response_model=PaymentRead,
    summary="Actualizar pago",
    description="Actualiza el importe o el estado de un pago. Requiere rol administrador.",
)
def update_payment(
    payment_id: int, data: PaymentUpdate, db: Session = Depends(get_db)
) -> PaymentRead:
    return payment_service.update_payment(db, payment_id, data)


@router.delete(
    "/{payment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pago",
    description="Elimina un pago. Requiere rol administrador.",
)
def delete_payment(payment_id: int, db: Session = Depends(get_db)) -> None:
    payment_service.delete_payment(db, payment_id)
