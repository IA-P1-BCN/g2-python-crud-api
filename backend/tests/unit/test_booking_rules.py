"""Booking rules that depend on the clock, checked at their exact limits.

The `schedule` fixture is a Monday 10:00-11:00 session of an active class with 2 spots.
"""

from datetime import datetime, time, timedelta

import pytest

from app.core.exceptions import BusinessRuleError, InvalidDataError
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate
from app.services import booking_service


@pytest.fixture()
def session_start(schedule, next_date_for_weekday) -> datetime:
    return datetime.combine(next_date_for_weekday(schedule.day_of_week), schedule.start_time)


def _book(db_session, member, schedule, session_start: datetime, now: datetime) -> Booking:
    data = BookingCreate(
        member_id=member.id, schedule_id=schedule.id, booking_date=session_start.date()
    )
    return booking_service.create_booking(db_session, data, now=now)


@pytest.fixture()
def booking(db_session, member, schedule, active_membership, session_start) -> Booking:
    return _book(db_session, member, schedule, session_start, now=session_start - timedelta(days=1))


# No bookings in the past


def test_a_session_can_be_booked_until_just_before_it_starts(
    db_session, member, schedule, active_membership, session_start
) -> None:
    now = session_start - timedelta(minutes=1)

    booking = _book(db_session, member, schedule, session_start, now)

    assert booking.status == BookingStatus.confirmed


@pytest.mark.parametrize(
    "after_start",
    [timedelta(0), timedelta(minutes=1), timedelta(hours=3), timedelta(days=1), timedelta(days=30)],
)
def test_a_session_that_has_started_or_passed_cannot_be_booked(
    db_session, member, schedule, active_membership, session_start, after_start: timedelta
) -> None:
    with pytest.raises(InvalidDataError, match="ya ha empezado"):
        _book(db_session, member, schedule, session_start, now=session_start + after_start)


def test_a_session_later_today_can_be_booked(
    db_session, member, schedule, active_membership, session_start
) -> None:
    early_that_morning = datetime.combine(session_start.date(), time(7, 0))

    booking = _book(db_session, member, schedule, session_start, now=early_that_morning)

    assert booking.booking_date == session_start.date()


# Only active classes


def test_an_inactive_class_cannot_be_booked(
    db_session, member, schedule, gym_class, active_membership, session_start
) -> None:
    gym_class.is_active = False
    db_session.commit()

    with pytest.raises(BusinessRuleError, match="no está activa"):
        _book(db_session, member, schedule, session_start, now=session_start - timedelta(days=1))


# Cancellation deadline


def test_the_cancellation_deadline_is_two_hours() -> None:
    assert booking_service.CANCELLATION_DEADLINE == timedelta(hours=2)


@pytest.mark.parametrize(
    "before_start", [timedelta(hours=2), timedelta(hours=5), timedelta(days=3)]
)
def test_a_member_can_cancel_up_to_the_deadline(
    db_session, member, booking, session_start, before_start: timedelta
) -> None:
    cancelled = booking_service.cancel_booking(
        db_session, booking.id, cancelled_by=member, now=session_start - before_start
    )

    assert cancelled.status == BookingStatus.cancelled


@pytest.mark.parametrize(
    "from_start",
    [
        -timedelta(hours=1, minutes=59),
        -timedelta(minutes=1),
        timedelta(0),
        timedelta(hours=1),
        timedelta(days=2),
    ],
)
def test_a_member_cannot_cancel_after_the_deadline(
    db_session, member, booking, session_start, from_start: timedelta
) -> None:
    with pytest.raises(BusinessRuleError, match="hasta 2 horas antes"):
        booking_service.cancel_booking(
            db_session, booking.id, cancelled_by=member, now=session_start + from_start
        )

    db_session.refresh(booking)
    assert booking.status == BookingStatus.confirmed


@pytest.mark.parametrize("from_start", [-timedelta(minutes=10), timedelta(days=2)])
def test_an_admin_can_cancel_after_the_deadline(
    db_session, admin, booking, session_start, from_start: timedelta
) -> None:
    cancelled = booking_service.cancel_booking(
        db_session, booking.id, cancelled_by=admin, now=session_start + from_start
    )

    assert cancelled.status == BookingStatus.cancelled
