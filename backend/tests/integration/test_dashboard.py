"""Admin dashboard figures, checked against a small gym with known data."""

from datetime import UTC, date, datetime, time

import pytest
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.room import Room
from app.models.user import User, UserRole
from app.services import dashboard_service

DASHBOARD_URL = "/api/v1/admin/dashboard"

# A Wednesday. The 7-day period runs from Thursday 1 Oct to Wednesday 7 Oct.
TODAY = date(2026, 10, 7)
MONDAY, WEDNESDAY = 0, 2


def _add(db: Session, instance):
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def _member(db: Session, name: str, created: date, deactivated: date | None = None) -> User:
    return _add(
        db,
        User(
            email=f"{name.lower()}@test.dev",
            full_name=name,
            role=UserRole.member,
            hashed_password=hash_password("password123"),
            is_active=deactivated is None,
            created_at=datetime.combine(created, time(12), tzinfo=UTC),
            deactivated_at=(
                datetime.combine(deactivated, time(12), tzinfo=UTC) if deactivated else None
            ),
        ),
    )


@pytest.fixture()
def gym(db_session, trainer, admin) -> dict:
    """Two active members, one signed off, two plans, two classes and a handful of bookings."""
    db = db_session
    ana = _member(db, "Ana", created=date(2026, 10, 6))
    bea = _member(db, "Bea", created=date(2026, 9, 20))
    carla = _member(db, "Carla", created=date(2026, 1, 1), deactivated=date(2026, 10, 5))

    monthly = _add(db, MembershipPlan(name="Mensual", price_cents=3000, duration_days=30))
    quarterly = _add(db, MembershipPlan(name="Trimestral", price_cents=9000, duration_days=90))
    ana_membership = _add(
        db,
        Membership(
            user_id=ana.id,
            plan_id=monthly.id,
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 10),
        ),
    )
    _add(
        db,
        Membership(
            user_id=bea.id,
            plan_id=quarterly.id,
            start_date=date(2026, 9, 20),
            end_date=date(2026, 12, 19),
        ),
    )
    _add(
        db,
        Membership(
            user_id=carla.id,
            plan_id=monthly.id,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 10, 9),
            status=MembershipStatus.cancelled,
        ),
    )

    room = _add(db, Room(name="Sala 1", capacity=20))
    yoga = _add(db, GymClass(name="Yoga", capacity=2, trainer_id=trainer.id, room_id=room.id))
    spinning = _add(
        db, GymClass(name="Spinning", capacity=5, trainer_id=trainer.id, room_id=room.id)
    )

    def schedule(gym_class: GymClass, day: int, hour: int) -> ClassSchedule:
        return _add(
            db,
            ClassSchedule(
                class_id=gym_class.id,
                day_of_week=day,
                start_time=time(hour),
                end_time=time(hour + 1),
                room_id=room.id,
            ),
        )

    yoga_wed = schedule(yoga, WEDNESDAY, 10)
    spinning_mon = schedule(spinning, MONDAY, 18)
    spinning_wed = schedule(spinning, WEDNESDAY, 18)

    def book(user: User, session: ClassSchedule, day: date, **extra) -> None:
        _add(db, Booking(member_id=user.id, schedule_id=session.id, booking_date=day, **extra))

    book(ana, yoga_wed, TODAY)
    book(bea, yoga_wed, TODAY)
    book(ana, spinning_mon, date(2026, 10, 5))
    book(bea, spinning_wed, TODAY, status=BookingStatus.cancelled)
    book(bea, spinning_mon, date(2026, 9, 28))  # only inside the 30-day period

    return {
        "ana": ana,
        "monthly": monthly,
        "quarterly": quarterly,
        "ana_membership": ana_membership,
        "yoga": yoga,
        "spinning": spinning,
    }


def _summary(db_session, period: str = "7d"):
    return dashboard_service.get_summary(db_session, period, today=TODAY)


def test_period_covers_the_requested_days(db_session, gym) -> None:
    assert (_summary(db_session, "today").period.start, TODAY) == (TODAY, TODAY)
    assert _summary(db_session, "7d").period.start == date(2026, 10, 1)
    assert _summary(db_session, "30d").period.start == date(2026, 9, 8)


def test_members_counts_only_members(db_session, gym) -> None:
    members = _summary(db_session).members

    # Trainer and admin fixtures are not members; Carla is signed off.
    assert members.active == 2
    assert members.signups == 1
    assert members.sign_offs == 1


def test_member_signups_follow_the_period(db_session, gym) -> None:
    assert _summary(db_session, "today").members.signups == 0
    assert _summary(db_session, "30d").members.signups == 2


def test_weekly_movements_cover_the_last_four_weeks(db_session, gym) -> None:
    weeks = _summary(db_session).weekly_movements

    assert [(week.start, week.end) for week in weeks] == [
        (date(2026, 9, 10), date(2026, 9, 16)),
        (date(2026, 9, 17), date(2026, 9, 23)),
        (date(2026, 9, 24), date(2026, 9, 30)),
        (date(2026, 10, 1), date(2026, 10, 7)),
    ]
    assert [week.signups for week in weeks] == [0, 1, 0, 1]
    assert [week.sign_offs for week in weeks] == [0, 0, 0, 1]


def test_bookings_count_confirmed_ones_per_day(db_session, gym) -> None:
    bookings = _summary(db_session).bookings

    assert bookings.total == 3
    assert len(bookings.by_day) == 7
    per_day = {item.day: item.count for item in bookings.by_day}
    assert per_day[TODAY] == 2
    assert per_day[date(2026, 10, 5)] == 1
    assert per_day[date(2026, 10, 2)] == 0


def test_bookings_follow_the_period(db_session, gym) -> None:
    assert _summary(db_session, "today").bookings.total == 2
    assert _summary(db_session, "30d").bookings.total == 4


def test_occupancy_compares_bookings_with_offered_spots(db_session, gym) -> None:
    occupancy = _summary(db_session).occupancy

    # Yoga: one Wednesday session of 2 spots, both taken.
    # Spinning: Monday and Wednesday sessions of 5 spots, one taken (the cancelled one is out).
    by_class = {item.name: item for item in occupancy.by_class}
    assert (by_class["Yoga"].booked, by_class["Yoga"].capacity, by_class["Yoga"].rate) == (
        2,
        2,
        1.0,
    )
    assert (by_class["Spinning"].booked, by_class["Spinning"].capacity) == (1, 10)
    assert by_class["Spinning"].rate == 0.1
    assert [item.name for item in occupancy.by_class] == ["Yoga", "Spinning"]
    assert occupancy.average_rate == 0.25


def test_occupancy_skips_classes_without_sessions_in_the_period(db_session, gym) -> None:
    # Today is Wednesday: Spinning has one session, on Monday it would have none.
    monday = date(2026, 10, 5)

    occupancy = dashboard_service.get_summary(db_session, "today", today=monday).occupancy

    assert [item.name for item in occupancy.by_class] == ["Spinning"]


def test_expiring_memberships_within_seven_days(db_session, gym) -> None:
    expiring = _summary(db_session).expiring_memberships

    # Bea's ends in December; Carla's is cancelled.
    assert len(expiring) == 1
    assert expiring[0].membership_id == gym["ana_membership"].id
    assert expiring[0].full_name == "Ana"
    assert expiring[0].plan_name == "Mensual"
    assert expiring[0].days_left == 3


def test_plans_show_share_and_monthly_revenue(db_session, gym) -> None:
    plans = _summary(db_session).plans

    assert plans.active_memberships == 2
    # 30 EUR per 30 days + 90 EUR per 90 days = 60 EUR a month
    assert plans.monthly_recurring_cents == 6000
    assert [(plan.name, plan.members, plan.share) for plan in plans.by_plan] == [
        ("Mensual", 1, 0.5),
        ("Trimestral", 1, 0.5),
    ]


def test_popular_classes_are_ranked_by_bookings(db_session, gym) -> None:
    popular = _summary(db_session).popular_classes

    assert [(item.name, item.bookings) for item in popular] == [("Yoga", 2), ("Spinning", 1)]


# Through the API


def test_dashboard_of_an_empty_gym_is_all_zeros(client) -> None:
    response = client.get(DASHBOARD_URL)

    assert response.status_code == 200
    body = response.json()
    assert body["period"]["key"] == "7d"
    assert body["members"] == {"active": 0, "signups": 0, "sign_offs": 0}
    assert len(body["weekly_movements"]) == 4
    assert body["bookings"]["total"] == 0
    assert len(body["bookings"]["by_day"]) == 7
    assert body["occupancy"] == {"average_rate": 0.0, "by_class": []}
    assert body["expiring_memberships"] == []
    assert body["plans"] == {"active_memberships": 0, "monthly_recurring_cents": 0, "by_plan": []}
    assert body["popular_classes"] == []


@pytest.mark.parametrize(("period", "days"), [("today", 1), ("7d", 7), ("30d", 30)])
def test_dashboard_accepts_each_period(client, period: str, days: int) -> None:
    response = client.get(DASHBOARD_URL, params={"period": period})

    assert response.status_code == 200
    assert len(response.json()["bookings"]["by_day"]) == days


def test_dashboard_rejects_an_unknown_period(client) -> None:
    response = client.get(DASHBOARD_URL, params={"period": "year"})

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_dashboard_reads_the_real_data(client, member, active_membership) -> None:
    body = client.get(DASHBOARD_URL).json()

    assert body["members"]["active"] == 1
    assert body["members"]["signups"] == 1
    assert body["plans"]["active_memberships"] == 1
