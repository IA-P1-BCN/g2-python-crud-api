from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.booking import Booking
from app.models.room import Room

UNKNOWN_ID = 999999


def test_the_test_database_rejects_a_row_that_points_to_nothing(db_session, member) -> None:
    db_session.add(
        Booking(member_id=member.id, schedule_id=UNKNOWN_ID, booking_date=date(2026, 10, 12))
    )

    with pytest.raises(IntegrityError):
        db_session.commit()


def test_the_test_database_rejects_deleting_a_row_still_in_use(db_session, schedule) -> None:
    db_session.delete(db_session.get(Room, schedule.room_id))

    with pytest.raises(IntegrityError):
        db_session.commit()
