from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.services import export_service

router = APIRouter(prefix="/export", tags=["export"], dependencies=[Depends(require_admin)])


def _csv_response(content: str, filename: str) -> Response:
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/members.csv", response_class=Response)
def export_members(db: Session = Depends(get_db)) -> Response:
    return _csv_response(export_service.members_csv(db), "members.csv")


@router.get("/bookings.csv", response_class=Response)
def export_bookings(db: Session = Depends(get_db)) -> Response:
    return _csv_response(export_service.bookings_csv(db), "bookings.csv")
