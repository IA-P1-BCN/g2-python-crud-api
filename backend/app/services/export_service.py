import csv
import io
from collections.abc import Iterator
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole

MEMBERS_HEADER = ("id", "email", "full_name", "role", "is_active")
BOOKINGS_HEADER = ("id", "member_id", "schedule_id", "booking_date", "status")


def _csv_chunks(header: tuple[str, ...], rows: list[list[object]]) -> Iterator[str]:
    """Yield the CSV as a stream: first the header, then one chunk per row."""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    yield buffer.getvalue()

    for row in rows:
        buffer.seek(0)
        buffer.truncate(0)
        writer.writerow(row)
        yield buffer.getvalue()


def members_csv(db: Session, *, role: UserRole | None = None) -> Iterator[str]:
    stmt = select(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
    stmt = stmt.order_by(User.id)

    rows = [
        [user.id, user.email, user.full_name, user.role.value, user.is_active]
        for user in db.execute(stmt).scalars()
    ]
    return _csv_chunks(MEMBERS_HEADER, rows)


def bookings_csv(
    db: Session,
    *,
    member_id: int | None = None,
    schedule_id: int | None = None,
    status: BookingStatus | None = None,
    on_date: date | None = None,
) -> Iterator[str]:
    stmt = select(Booking)
    filters = []
    if member_id is not None:
        filters.append(Booking.member_id == member_id)
    if schedule_id is not None:
        filters.append(Booking.schedule_id == schedule_id)
    if status is not None:
        filters.append(Booking.status == status)
    if on_date is not None:
        filters.append(Booking.booking_date == on_date)
    if filters:
        stmt = stmt.where(*filters)
    stmt = stmt.order_by(Booking.id)

    rows = [
        [
            booking.id,
            booking.member_id,
            booking.schedule_id,
            booking.booking_date.isoformat(),
            booking.status.value,
        ]
        for booking in db.execute(stmt).scalars()
    ]
    return _csv_chunks(BOOKINGS_HEADER, rows)
