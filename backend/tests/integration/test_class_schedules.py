from datetime import date

import pytest

from app.models.booking import Booking, BookingStatus
from app.models.room import Room

SCHEDULES_URL = "/api/v1/class-schedules"


def _schedule_payload(class_id: int, room_id: int | None, **overrides) -> dict:
    return {
        "class_id": class_id,
        "day_of_week": 2,
        "start_time": "18:00:00",
        "end_time": "19:00:00",
        "room_id": room_id,
    } | overrides


@pytest.fixture()
def other_room(db_session) -> Room:
    room = Room(name="Sala 2", capacity=10)
    db_session.add(room)
    db_session.commit()
    db_session.refresh(room)
    return room


# POST /class-schedules


def test_create_schedule(client, gym_class, room) -> None:
    response = client.post(SCHEDULES_URL, json=_schedule_payload(gym_class.id, room.id))

    assert response.status_code == 201
    body = response.json()
    assert body["class_id"] == gym_class.id
    assert body["day_of_week"] == 2
    assert body["start_time"] == "18:00:00"
    assert body["end_time"] == "19:00:00"
    assert body["room_id"] == room.id


@pytest.mark.parametrize(
    "missing_field", ["class_id", "day_of_week", "start_time", "end_time", "room_id"]
)
def test_create_schedule_requires_class_day_times_and_room(
    client, gym_class, room, missing_field: str
) -> None:
    payload = _schedule_payload(gym_class.id, room.id)
    del payload[missing_field]

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_create_schedule_room_cannot_be_null(client, gym_class) -> None:
    response = client.post(SCHEDULES_URL, json=_schedule_payload(gym_class.id, None))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize(
    ("start_time", "end_time"),
    [("19:00:00", "18:00:00"), ("18:00:00", "18:00:00")],
)
def test_create_schedule_start_must_be_before_end(
    client, gym_class, room, start_time: str, end_time: str
) -> None:
    payload = _schedule_payload(gym_class.id, room.id, start_time=start_time, end_time=end_time)

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("day_of_week", [-1, 7])
def test_create_schedule_day_of_week_must_be_0_to_6(
    client, gym_class, room, day_of_week: int
) -> None:
    payload = _schedule_payload(gym_class.id, room.id, day_of_week=day_of_week)

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_create_schedule_with_unknown_class_returns_404(client, room) -> None:
    response = client.post(SCHEDULES_URL, json=_schedule_payload(9999, room.id))

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_create_schedule_with_unknown_room_returns_404(client, gym_class) -> None:
    response = client.post(SCHEDULES_URL, json=_schedule_payload(gym_class.id, 9999))

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


@pytest.mark.parametrize(
    ("start_time", "end_time"),
    [
        ("10:00:00", "11:00:00"),  # same slot
        ("10:30:00", "11:30:00"),  # starts inside
        ("09:30:00", "10:30:00"),  # ends inside
        ("09:00:00", "12:00:00"),  # contains it
    ],
)
def test_create_schedule_overlapping_same_room_and_day_returns_409(
    client, gym_class, room, schedule, start_time: str, end_time: str
) -> None:
    payload = _schedule_payload(
        gym_class.id,
        room.id,
        day_of_week=schedule.day_of_week,
        start_time=start_time,
        end_time=end_time,
    )

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


def test_create_schedule_right_after_another_is_allowed(client, gym_class, room, schedule) -> None:
    payload = _schedule_payload(
        gym_class.id,
        room.id,
        day_of_week=schedule.day_of_week,
        start_time="11:00:00",
        end_time="12:00:00",
    )

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 201


def test_create_schedule_same_slot_on_another_day_is_allowed(
    client, gym_class, room, schedule
) -> None:
    payload = _schedule_payload(
        gym_class.id, room.id, day_of_week=1, start_time="10:00:00", end_time="11:00:00"
    )

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 201


def test_create_schedule_same_slot_in_another_room_is_allowed(
    client, gym_class, schedule, other_room
) -> None:
    payload = _schedule_payload(
        gym_class.id,
        other_room.id,
        day_of_week=schedule.day_of_week,
        start_time="10:00:00",
        end_time="11:00:00",
    )

    response = client.post(SCHEDULES_URL, json=payload)

    assert response.status_code == 201


# GET /class-schedules


def test_list_schedules_is_paginated(client, gym_class, room) -> None:
    for day in (1, 2, 3):
        client.post(SCHEDULES_URL, json=_schedule_payload(gym_class.id, room.id, day_of_week=day))

    response = client.get(SCHEDULES_URL, params={"page": 2, "size": 2})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert [item["day_of_week"] for item in body["items"]] == [3]


def test_list_schedules_filters_by_class(client, gym_class, schedule) -> None:
    own = client.get(SCHEDULES_URL, params={"class_id": gym_class.id})
    other = client.get(SCHEDULES_URL, params={"class_id": 9999})

    assert [item["id"] for item in own.json()["items"]] == [schedule.id]
    assert other.json()["total"] == 0


def test_list_schedules_filters_by_day_of_week(client, gym_class, room, schedule) -> None:
    client.post(SCHEDULES_URL, json=_schedule_payload(gym_class.id, room.id, day_of_week=4))

    response = client.get(SCHEDULES_URL, params={"day_of_week": schedule.day_of_week})

    assert [item["id"] for item in response.json()["items"]] == [schedule.id]


# GET /class-schedules/{schedule_id}


def test_get_schedule(client, schedule) -> None:
    response = client.get(f"{SCHEDULES_URL}/{schedule.id}")

    assert response.status_code == 200
    assert response.json()["start_time"] == "10:00:00"


def test_get_unknown_schedule_returns_404(client) -> None:
    response = client.get(f"{SCHEDULES_URL}/9999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# PUT /class-schedules/{schedule_id}


def test_update_schedule(client, schedule) -> None:
    response = client.put(
        f"{SCHEDULES_URL}/{schedule.id}",
        json={"day_of_week": 3, "start_time": "12:00:00", "end_time": "13:30:00"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["day_of_week"] == 3
    assert body["start_time"] == "12:00:00"
    assert body["end_time"] == "13:30:00"
    assert body["room_id"] == schedule.room_id


def test_update_schedule_does_not_conflict_with_itself(client, schedule) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json={"end_time": "11:30:00"})

    assert response.status_code == 200
    assert response.json()["end_time"] == "11:30:00"


def test_update_schedule_overlapping_another_returns_409(client, gym_class, room, schedule) -> None:
    other = client.post(
        SCHEDULES_URL,
        json=_schedule_payload(
            gym_class.id,
            room.id,
            day_of_week=schedule.day_of_week,
            start_time="12:00:00",
            end_time="13:00:00",
        ),
    ).json()

    response = client.put(
        f"{SCHEDULES_URL}/{other['id']}", json={"start_time": "10:30:00", "end_time": "11:30:00"}
    )

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


def test_update_schedule_day_of_week_must_be_0_to_6(client, schedule) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json={"day_of_week": 7})

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize(
    "changes",
    [
        {"start_time": "12:00:00", "end_time": "11:00:00"},  # both sent
        {"end_time": "09:00:00"},  # before the stored start (10:00)
        {"start_time": "11:00:00"},  # equal to the stored end (11:00)
    ],
)
def test_update_schedule_start_must_be_before_end(client, schedule, changes: dict) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json=changes)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_update_schedule_room_cannot_be_removed(client, schedule) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json={"room_id": None})

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"
    assert client.get(f"{SCHEDULES_URL}/{schedule.id}").json()["room_id"] == schedule.room_id


def test_update_schedule_with_unknown_class_returns_404(client, schedule) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json={"class_id": 9999})

    assert response.status_code == 404


def test_update_schedule_with_unknown_room_returns_404(client, schedule) -> None:
    response = client.put(f"{SCHEDULES_URL}/{schedule.id}", json={"room_id": 9999})

    assert response.status_code == 404


def test_update_unknown_schedule_returns_404(client) -> None:
    response = client.put(f"{SCHEDULES_URL}/9999", json={"day_of_week": 1})

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


# DELETE /class-schedules/{schedule_id}


def test_delete_schedule(client, schedule) -> None:
    deleted = client.delete(f"{SCHEDULES_URL}/{schedule.id}")

    assert deleted.status_code == 204
    assert client.get(f"{SCHEDULES_URL}/{schedule.id}").status_code == 404


def test_delete_unknown_schedule_returns_404(client) -> None:
    response = client.delete(f"{SCHEDULES_URL}/9999")

    assert response.status_code == 404


# GET /class-schedules/{schedule_id}/bookings


def test_list_schedule_bookings(client, db_session, schedule, member) -> None:
    booking = Booking(member_id=member.id, schedule_id=schedule.id, booking_date=date(2026, 10, 5))
    db_session.add(booking)
    db_session.commit()

    response = client.get(f"{SCHEDULES_URL}/{schedule.id}/bookings")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["member_id"] == member.id
    assert body["items"][0]["schedule_id"] == schedule.id


def test_list_bookings_of_unknown_schedule_returns_404(client) -> None:
    response = client.get(f"{SCHEDULES_URL}/9999/bookings")

    assert response.status_code == 404


# GET /class-schedules/{schedule_id}/availability

SESSION_DATE = date(2026, 10, 12)


def _book(db_session, member_id: int, schedule_id: int, **overrides) -> Booking:
    booking = Booking(
        **(
            {"member_id": member_id, "schedule_id": schedule_id, "booking_date": SESSION_DATE}
            | overrides
        )
    )
    db_session.add(booking)
    db_session.commit()
    return booking


def _availability(client, schedule_id: int, on_date: date = SESSION_DATE):
    return client.get(
        f"{SCHEDULES_URL}/{schedule_id}/availability", params={"on_date": on_date.isoformat()}
    )


def test_availability_of_an_empty_session(client, schedule, gym_class) -> None:
    response = _availability(client, schedule.id)

    assert response.status_code == 200
    assert response.json() == {
        "schedule_id": schedule.id,
        "on_date": "2026-10-12",
        "capacity": gym_class.capacity,
        "booked": 0,
        "available": gym_class.capacity,
    }


def test_availability_counts_confirmed_bookings(client, db_session, schedule, member) -> None:
    _book(db_session, member.id, schedule.id)

    body = _availability(client, schedule.id).json()

    assert body["booked"] == 1
    assert body["available"] == body["capacity"] - 1


def test_availability_ignores_cancelled_bookings(client, db_session, schedule, member) -> None:
    _book(db_session, member.id, schedule.id, status=BookingStatus.cancelled)

    body = _availability(client, schedule.id).json()

    assert body["booked"] == 0
    assert body["available"] == body["capacity"]


def test_availability_is_per_date(client, db_session, schedule, member) -> None:
    _book(db_session, member.id, schedule.id, booking_date=date(2026, 10, 19))

    assert _availability(client, schedule.id).json()["booked"] == 0
    assert _availability(client, schedule.id, date(2026, 10, 19)).json()["booked"] == 1


def test_availability_of_a_full_session_is_zero(
    client, db_session, schedule, gym_class, member, trainer, admin
) -> None:
    # The gym_class fixture has capacity 2; a third row must not turn the result negative.
    for user in (member, trainer, admin):
        _book(db_session, user.id, schedule.id)

    body = _availability(client, schedule.id).json()

    assert body["capacity"] == gym_class.capacity == 2
    assert body["booked"] == 3
    assert body["available"] == 0


def test_availability_matches_what_booking_allows(
    client, schedule, member, active_membership, next_date_for_weekday
) -> None:
    booking_date = next_date_for_weekday(schedule.day_of_week)
    before = _availability(client, schedule.id, booking_date).json()

    created = client.post(
        "/api/v1/bookings",
        json={
            "member_id": member.id,
            "schedule_id": schedule.id,
            "booking_date": str(booking_date),
        },
    )
    after = _availability(client, schedule.id, booking_date).json()

    assert created.status_code == 201
    assert after["available"] == before["available"] - 1


def test_availability_is_public(anon_client, schedule) -> None:
    response = _availability(anon_client, schedule.id)

    assert response.status_code == 200


def test_availability_of_unknown_schedule_returns_404(client) -> None:
    response = _availability(client, 9999)

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_availability_requires_a_valid_date(client, schedule) -> None:
    missing = client.get(f"{SCHEDULES_URL}/{schedule.id}/availability")
    invalid = client.get(
        f"{SCHEDULES_URL}/{schedule.id}/availability", params={"on_date": "not-a-date"}
    )

    assert missing.status_code == 422
    assert invalid.status_code == 422
