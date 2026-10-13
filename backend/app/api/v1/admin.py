from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Pagination, build_page, get_db, require_admin
from app.schemas.admin_member import AdminMember
from app.schemas.common import Page
from app.schemas.dashboard import DashboardPeriod, DashboardSummary
from app.schemas.user import UserFilters
from app.services import admin_member_service, dashboard_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get(
    "/dashboard",
    response_model=DashboardSummary,
    summary="Resumen del panel de administración",
    description=(
        "Cifras del gimnasio para el periodo elegido (`today`, `7d` o `30d`): socios activos, "
        "altas y bajas, reservas por día, ocupación de clases, membresías que vencen en 7 días, "
        "planes más contratados y clases más populares. Solo administradores."
    ),
)
def get_dashboard(
    period: DashboardPeriod = "7d", db: Session = Depends(get_db)
) -> DashboardSummary:
    return dashboard_service.get_summary(db, period)


@router.get(
    "/members",
    response_model=Page[AdminMember],
    summary="Socios con su plan y su último pago",
    description=(
        "Lista los socios paginados, cada uno con su membresía en vigor (o la última que tuvo) "
        "y su pago más reciente, en una sola llamada. Acepta los filtros de `GET /users` "
        "(`search`, `is_active` y fechas de alta y de baja); `role` se ignora porque siempre "
        "devuelve socios. Solo administradores."
    ),
)
def list_members(
    filters: Annotated[UserFilters, Query()],
    pagination: Pagination = Depends(),
    db: Session = Depends(get_db),
) -> Page[AdminMember]:
    items, total = admin_member_service.list_members(
        db, page=pagination.page, size=pagination.size, filters=filters
    )
    return build_page(items, total, pagination)
