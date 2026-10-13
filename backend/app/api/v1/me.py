from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.member_dashboard import MemberDashboard
from app.services import member_dashboard_service

router = APIRouter(prefix="/me", tags=["me"])


@router.get(
    "/dashboard",
    response_model=MemberDashboard,
    summary="Resumen del socio",
    description=(
        "Lo que necesita la pantalla de inicio del usuario con sesión, en una sola llamada: "
        "membresía en vigor con días restantes, próximas reservas confirmadas (con clase, "
        "horario, sala y entrenador) y reservas del mes. Solo devuelve datos propios."
    ),
)
def get_my_dashboard(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> MemberDashboard:
    return member_dashboard_service.get_dashboard(db, current_user)
