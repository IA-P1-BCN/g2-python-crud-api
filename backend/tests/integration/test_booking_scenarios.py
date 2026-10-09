"""Booking scenarios through the API: members competing for spots and overlapping sessions.

The `schedule` fixture is a Monday 10:00-11:00 session of a class with 2 spots.
"""

from datetime import date, timedelta

import pytest

API = "/api/v1"
BOOKINGS_URL = f"{API}/bookings"


@pytest.fixture()
def session_date(schedule, next_date_for_weekday) -> date:
    return next_date_for_weekday(schedule.day_of_week)


def _new_member(client, plan, email: str) -> int:
    """Create a member with an active membership and return their id."""
    user = client.post(
        f"{API}/users",
        json={"email": email, "full_name": "Socio Extra", "password": "Password123!"},
    ).json()
    client.post(
        f"{API}/memberships",
        json={"user_id": user["id"], "plan_id": plan.id, "start_date": date.today().isoformat()},
    )
    return user["id"]


def _book(client, member_id: int, schedule_id: int, on_date: date):
    return client.post(
        BOOKINGS_URL,
        json={
            "member_id": member_id,
            "schedule_id": schedule_id,
            "booking_date": on_date.isoformat(),
        },
    )


def _available(client, schedule_id: int, on_date: date) -> int:
    response = client.get(
        f"{API}/class-schedules/{schedule_id}/availability",
        params={"on_date": on_date.isoformat()},
    )
    return response.json()["available"]


def _other_schedule(client, trainer, start_time: str, end_time: str) -> int:
    """A second Monday session in another room, so only the member's agenda can clash."""
    room = client.post(f"{API}/rooms", json={"name": "Sala 2", "capacity": 20}).json()
    gym_class = client.post(
        f"{API}/classes",
        json={"name": "Pilates", "capacity": 10, "trainer_id": trainer.id, "room_id": room["id"]},
    ).json()
    schedule = client.post(
        f"{API}/class-schedules",
        json={
            "class_id": gym_class["id"],
            "day_of_week": 0,
            "start_time": start_time,
            "end_time": end_time,
            "room_id": room["id"],
        },
    ).json()
    return schedule["id"]


# Capacity: members competing for the last spot


def test_the_last_spot_goes_to_the_first_member_who_books(
    client, plan, schedule, session_date
) -> None:
    first, second, third = (_new_member(client, plan, f"{name}@test.dev") for name in "abc")

    assert _book(client, first, schedule.id, session_date).status_code == 201
    assert _book(client, second, schedule.id, session_date).status_code == 201
    rejected = _book(client, third, schedule.id, session_date)

    assert rejected.status_code == 409
    assert rejected.json()["code"] == "conflict"
    assert _available(client, schedule.id, session_date) == 0


def test_a_rejected_booking_is_not_stored(client, plan, schedule, session_date) -> None:
    first, second, third = (_new_member(client, plan, f"{name}@test.dev") for name in "abc")
    _book(client, first, schedule.id, session_date)
    _book(client, second, schedule.id, session_date)

    _book(client, third, schedule.id, session_date)

    assert client.get(f"{API}/users/{third}/bookings").json()["total"] == 0


def test_a_cancellation_frees_the_spot_for_another_member(
    client, plan, schedule, session_date
) -> None:
    first, second, third = (_new_member(client, plan, f"{name}@test.dev") for name in "abc")
    booking = _book(client, first, schedule.id, session_date).json()
    _book(client, second, schedule.id, session_date)

    client.delete(f"{BOOKINGS_URL}/{booking['id']}")

    assert _available(client, schedule.id, session_date) == 1
    assert _book(client, third, schedule.id, session_date).status_code == 201
    assert _available(client, schedule.id, session_date) == 0


def test_a_member_can_book_again_after_cancelling(client, plan, schedule, session_date) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    booking = _book(client, member_id, schedule.id, session_date).json()
    client.delete(f"{BOOKINGS_URL}/{booking['id']}")

    response = _book(client, member_id, schedule.id, session_date)

    assert response.status_code == 201
    assert _available(client, schedule.id, session_date) == 1


def test_spots_are_counted_for_each_date(client, plan, schedule, session_date) -> None:
    first, second, third = (_new_member(client, plan, f"{name}@test.dev") for name in "abc")
    _book(client, first, schedule.id, session_date)
    _book(client, second, schedule.id, session_date)
    next_week = session_date + timedelta(days=7)

    response = _book(client, third, schedule.id, next_week)

    assert response.status_code == 201
    assert _available(client, schedule.id, session_date) == 0
    assert _available(client, schedule.id, next_week) == 1


# Overlap: a member cannot be in two sessions at the same time


def test_a_member_cannot_book_the_same_session_twice(client, plan, schedule, session_date) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    _book(client, member_id, schedule.id, session_date)

    response = _book(client, member_id, schedule.id, session_date)

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"
    assert _available(client, schedule.id, session_date) == 1


@pytest.mark.parametrize(
    ("start_time", "end_time"),
    [
        ("10:30:00", "11:30:00"),
        ("09:30:00", "10:30:00"),
        ("10:15:00", "10:45:00"),
        ("09:00:00", "12:00:00"),
    ],
)
def test_a_member_cannot_book_two_sessions_that_overlap(
    client, plan, schedule, session_date, trainer, start_time: str, end_time: str
) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    other_schedule_id = _other_schedule(client, trainer, start_time, end_time)
    _book(client, member_id, schedule.id, session_date)

    response = _book(client, member_id, other_schedule_id, session_date)

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


@pytest.mark.parametrize(
    ("start_time", "end_time"), [("11:00:00", "12:00:00"), ("09:00:00", "10:00:00")]
)
def test_a_member_can_book_sessions_that_follow_each_other(
    client, plan, schedule, session_date, trainer, start_time: str, end_time: str
) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    other_schedule_id = _other_schedule(client, trainer, start_time, end_time)
    _book(client, member_id, schedule.id, session_date)

    response = _book(client, member_id, other_schedule_id, session_date)

    assert response.status_code == 201


def test_overlapping_sessions_on_different_dates_do_not_clash(
    client, plan, schedule, session_date, trainer
) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    other_schedule_id = _other_schedule(client, trainer, "10:30:00", "11:30:00")
    _book(client, member_id, schedule.id, session_date)

    response = _book(client, member_id, other_schedule_id, session_date + timedelta(days=7))

    assert response.status_code == 201


def test_a_cancelled_booking_does_not_block_an_overlapping_one(
    client, plan, schedule, session_date, trainer
) -> None:
    member_id = _new_member(client, plan, "a@test.dev")
    other_schedule_id = _other_schedule(client, trainer, "10:30:00", "11:30:00")
    booking = _book(client, member_id, schedule.id, session_date).json()
    client.delete(f"{BOOKINGS_URL}/{booking['id']}")

    response = _book(client, member_id, other_schedule_id, session_date)

    assert response.status_code == 201


def test_two_members_can_book_overlapping_sessions(
    client, plan, schedule, session_date, trainer
) -> None:
    first = _new_member(client, plan, "a@test.dev")
    second = _new_member(client, plan, "b@test.dev")
    other_schedule_id = _other_schedule(client, trainer, "10:30:00", "11:30:00")
    _book(client, first, schedule.id, session_date)

    response = _book(client, second, other_schedule_id, session_date)

    assert response.status_code == 201
