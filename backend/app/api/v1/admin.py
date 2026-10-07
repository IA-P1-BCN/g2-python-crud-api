from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.schemas.dashboard import DashboardPeriod, DashboardSummary
from app.services import dashboard_service

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
