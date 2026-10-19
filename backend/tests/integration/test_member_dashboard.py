"""Member home screen data, checked for one member with known bookings."""

from datetime import date, datetime, time, timedelta

import pytest
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.membership import Membership, MembershipStatus
from app.models.user import User, UserRole
from app.services import member_dashboard_service

DASHBOARD_URL = "/api/v1/me/dashboard"

# Wednesday 14 October 2026 at noon
NOW = datetime(2026, 10, 14, 12, 0)
WEDNESDAY = 2


def _add(db: Session, instance):
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def _book(db: Session, user: User, session: ClassSchedule, day: date, **extra) -> Booking:
    return _add(db, Booking(member_id=user.id, schedule_id=session.id, booking_date=day, **extra))


@pytest.fixture()
def wednesday_sessions(db_session, gym_class, room) -> dict[str, ClassSchedule]:
    def session(hour: int, room_id: int | None) -> ClassSchedule:
        return _add(
            db_session,
            ClassSchedule(
                class_id=gym_class.id,
                day_of_week=WEDNESDAY,
                start_time=time(hour),
                end_time=time(hour + 1),
                room_id=room_id,
            ),
        )

    return {"morning": session(9, room.id), "evening": session(18, None)}


@pytest.fixture()
def bookings(db_session, member, schedule, wednesday_sessions) -> dict[str, Booking]:
    """`schedule` is the Monday 10:00 session of Yoga, taught by the trainer fixture."""
    morning, evening = wednesday_sessions["morning"], wednesday_sessions["evening"]
    return {
        "last_month": _book(db_session, member, schedule, date(2026, 9, 28)),
        "monday": _book(db_session, member, schedule, date(2026, 10, 12)),
        "today_morning": _book(db_session, member, morning, date(2026, 10, 14)),
        "today_evening": _book(db_session, member, evening, date(2026, 10, 14)),
        "next_monday": _book(db_session, member, schedule, date(2026, 10, 19)),
        "cancelled": _book(
            db_session, member, morning, date(2026, 10, 21), status=BookingStatus.cancelled
        ),
    }


@pytest.fixture()
def october_membership(db_session, member, plan) -> Membership:
    return _add(
        db_session,
        Membership(
            user_id=member.id,
            plan_id=plan.id,
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 31),
        ),
    )


def _dashboard(db_session, user: User):
    return member_dashboard_service.get_dashboard(db_session, user, now=NOW)


# Membership


def test_membership_in_force_with_days_left(db_session, member, october_membership) -> None:
    membership = _dashboard(db_session, member).membership

    assert membership is not None
    assert membership.membership_id == october_membership.id
    assert membership.plan_name == "Mensual"
    assert (membership.start_date, membership.end_date) == (date(2026, 10, 1), date(2026, 10, 31))
    assert membership.status == MembershipStatus.active
    assert membership.days_left == 17


def test_no_membership_is_null(db_session, member) -> None:
    assert _dashboard(db_session, member).membership is None


@pytest.mark.parametrize(
    ("start", "end", "status"),
    [
        (date(2026, 9, 1), date(2026, 9, 30), MembershipStatus.active),  # already over
        (date(2026, 11, 1), date(2026, 11, 30), MembershipStatus.active),  # not started
        (date(2026, 10, 1), date(2026, 10, 31), MembershipStatus.cancelled),
    ],
)
def test_memberships_not_in_force_are_ignored(
    db_session, member, plan, start: date, end: date, status: MembershipStatus
) -> None:
    _add(
        db_session,
        Membership(
            user_id=member.id, plan_id=plan.id, start_date=start, end_date=end, status=status
        ),
    )

    assert _dashboard(db_session, member).membership is None


# Upcoming bookings


def test_upcoming_bookings_start_now_and_are_in_date_and_time_order(
    db_session, member, bookings
) -> None:
    upcoming = _dashboard(db_session, member).upcoming_bookings

    # Today's 9:00 session already started at noon; the cancelled one does not count.
    assert [item.booking_id for item in upcoming] == [
        bookings["today_evening"].id,
        bookings["next_monday"].id,
    ]


def test_upcoming_booking_carries_class_room_and_trainer(
    db_session, member, bookings, gym_class, trainer, room
) -> None:
    evening, monday = _dashboard(db_session, member).upcoming_bookings

    assert monday.class_name == gym_class.name
    assert monday.class_id == gym_class.id
    assert (monday.start_time, monday.end_time) == (time(10), time(11))
    assert monday.room_name == room.name
    assert monday.trainer_name == trainer.full_name
    assert monday.booking_date == date(2026, 10, 19)
    # A session without a room is still listed.
    assert evening.room_name is None


def test_upcoming_bookings_are_limited(db_session, member, schedule) -> None:
    for week in range(7):
        _book(db_session, member, schedule, date(2026, 10, 19) + timedelta(weeks=week))

    upcoming = _dashboard(db_session, member).upcoming_bookings

    assert len(upcoming) == member_dashboard_service.UPCOMING_LIMIT
    assert upcoming[0].booking_date == date(2026, 10, 19)


def test_other_members_bookings_are_not_shown(db_session, member, schedule) -> None:
    other = _add(
        db_session,
        User(
            email="otra@test.dev",
            full_name="Otra Socia",
            role=UserRole.member,
            hashed_password=hash_password("password123"),
        ),
    )
    _book(db_session, other, schedule, date(2026, 10, 19))

    dashboard = _dashboard(db_session, member)

    assert dashboard.upcoming_bookings == []
    assert dashboard.stats.total_bookings == 0


# Stats


def test_stats_count_confirmed_bookings(db_session, member, bookings) -> None:
    stats = _dashboard(db_session, member).stats

    # October: 12th, 14th twice and 19th. September's counts only in the total.
    assert stats.bookings_this_month == 4
    assert stats.total_bookings == 5


def test_month_boundaries_in_december(db_session, member, schedule) -> None:
    _book(db_session, member, schedule, date(2026, 12, 28))
    _book(db_session, member, schedule, date(2027, 1, 4))

    stats = member_dashboard_service.get_dashboard(
        db_session, member, now=datetime(2026, 12, 30, 9, 0)
    ).stats

    assert stats.bookings_this_month == 1


# Through the API


def test_dashboard_returns_the_callers_own_data(
    anon_client, member, october_membership, bookings
) -> None:
    token = create_access_token(member.id, member.role.value)

    response = anon_client.get(DASHBOARD_URL, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"membership", "upcoming_bookings", "stats"}
    assert body["membership"]["plan_name"] == "Mensual"
    assert body["stats"]["total_bookings"] == 5


def test_dashboard_of_a_user_without_data(anon_client, trainer) -> None:
    token = create_access_token(trainer.id, trainer.role.value)

    response = anon_client.get(DASHBOARD_URL, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {
        "membership": None,
        "upcoming_bookings": [],
        "stats": {"bookings_this_month": 0, "total_bookings": 0},
    }


def test_dashboard_requires_a_session(anon_client) -> None:
    response = anon_client.get(DASHBOARD_URL)

    assert response.status_code == 401
