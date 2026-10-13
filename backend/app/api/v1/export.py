from collections.abc import Iterable
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.booking import BookingStatus
from app.models.user import UserRole
from app.services import export_service

router = APIRouter(prefix="/export", tags=["export"], dependencies=[Depends(require_admin)])

CSV_MEDIA_TYPE = "text/csv; charset=utf-8"


def _csv_response(chunks: Iterable[str], filename: str) -> StreamingResponse:
    return StreamingResponse(
        chunks,
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/members.csv",
    response_class=StreamingResponse,
    summary="Exportar socios a CSV",
    description=(
        "Descarga los socios en formato CSV (UTF-8). Se puede filtrar por `role`. "
        "Requiere rol administrador."
    ),
)
def export_members(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    return _csv_response(export_service.members_csv(db, role=role), "members.csv")


@router.get(
    "/bookings.csv",
    response_class=StreamingResponse,
    summary="Exportar reservas a CSV",
    description=(
        "Descarga las reservas en formato CSV (UTF-8). Filtros: `member_id`, `schedule_id`, "
        "`status_filter` y `on_date`. Requiere rol administrador."
    ),
)
def export_bookings(
    member_id: int | None = None,
    schedule_id: int | None = None,
    status_filter: BookingStatus | None = None,
    on_date: date | None = None,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    return _csv_response(
        export_service.bookings_csv(
            db,
            member_id=member_id,
            schedule_id=schedule_id,
            status=status_filter,
            on_date=on_date,
        ),
        "bookings.csv",
    )
