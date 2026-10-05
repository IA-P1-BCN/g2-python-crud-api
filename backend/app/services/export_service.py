import csv
import io

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.user import User


def members_csv(db: Session) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "email", "full_name", "role", "is_active"])
    for user in db.execute(select(User).order_by(User.id)).scalars().all():
        writer.writerow([user.id, user.email, user.full_name, user.role.value, user.is_active])
    return output.getvalue()


def bookings_csv(db: Session) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "member_id", "schedule_id", "booking_date", "status"])
    for booking in db.execute(select(Booking).order_by(Booking.id)).scalars().all():
        writer.writerow(
            [
                booking.id,
                booking.member_id,
                booking.schedule_id,
                booking.booking_date.isoformat(),
                booking.status.value,
            ]
        )
    return output.getvalue()
