"""Booking and schedule rules as the API answers them, with the real clock.

The exact time limits are checked in `tests/unit/test_booking_rules.py`.
The `schedule` fixture is a Monday 10:00-11:00 session taught by `trainer`.
"""

from datetime import date, timedelta

import pytest

from app.core.security import create_access_token
from app.models.booking import Booking
from app.models.user import User

API = "/api/v1"
BOOKINGS_URL = f"{API}/bookings"


def _auth(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}


def _last_weekday(weekday: int) -> date:
    """The most recent date before today that fell on the weekday."""
    today = date.today()
    return today - timedelta(days=(today.weekday() - weekday - 1) % 7 + 1)


def _booking_payload(member, schedule, on_date: date) -> dict:
    return {
        "member_id": member.id,
        "schedule_id": schedule.id,
        "booking_date": on_date.isoformat(),
    }


# POST /bookings


def test_booking_a_past_date_returns_422(client, member, schedule, active_membership) -> None:
    past = _last_weekday(schedule.day_of_week)

    response = client.post(BOOKINGS_URL, json=_booking_payload(member, schedule, past))

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Esa sesión ya ha empezado o ya ha pasado",
        "code": "validation_error",
    }
    assert client.get(BOOKINGS_URL).json()["total"] == 0


def test_booking_an_inactive_class_returns_400(
    client, member, schedule, gym_class, active_membership, next_date_for_weekday
) -> None:
    client.put(f"{API}/classes/{gym_class.id}", json={"is_active": False})
    on_date = next_date_for_weekday(schedule.day_of_week)

    response = client.post(BOOKINGS_URL, json=_booking_payload(member, schedule, on_date))

    assert response.status_code == 400
    assert response.json() == {"detail": "La clase no está activa", "code": "business_rule"}


def test_a_reactivated_class_can_be_booked_again(
    client, member, schedule, gym_class, active_membership, next_date_for_weekday
) -> None:
    client.put(f"{API}/classes/{gym_class.id}", json={"is_active": False})
    client.put(f"{API}/classes/{gym_class.id}", json={"is_active": True})
    on_date = next_date_for_weekday(schedule.day_of_week)

    response = client.post(BOOKINGS_URL, json=_booking_payload(member, schedule, on_date))

    assert response.status_code == 201


# DELETE /bookings/{id}


@pytest.fixture()
def past_booking(db_session, member, schedule) -> Booking:
    booking = Booking(
        member_id=member.id,
        schedule_id=schedule.id,
        booking_date=_last_weekday(schedule.day_of_week),
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


def test_member_cannot_cancel_after_the_deadline(anon_client, member, past_booking) -> None:
    response = anon_client.delete(f"{BOOKINGS_URL}/{past_booking.id}", headers=_auth(member))

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Las reservas se pueden cancelar hasta 2 horas antes de la clase",
        "code": "business_rule",
    }
    booking = anon_client.get(f"{BOOKINGS_URL}/{past_booking.id}", headers=_auth(member)).json()
    assert booking["status"] == "confirmed"


def test_admin_can_cancel_after_the_deadline(anon_client, admin, past_booking) -> None:
    response = anon_client.delete(f"{BOOKINGS_URL}/{past_booking.id}", headers=_auth(admin))

    assert response.status_code == 204
    booking = anon_client.get(f"{BOOKINGS_URL}/{past_booking.id}", headers=_auth(admin)).json()
    assert booking["status"] == "cancelled"


def test_member_can_cancel_a_booking_for_next_week(
    anon_client, db_session, member, schedule, next_date_for_weekday
) -> None:
    booking = Booking(
        member_id=member.id,
        schedule_id=schedule.id,
        booking_date=next_date_for_weekday(schedule.day_of_week) + timedelta(days=7),
    )
    db_session.add(booking)
    db_session.commit()

    response = anon_client.delete(f"{BOOKINGS_URL}/{booking.id}", headers=_auth(member))

    assert response.status_code == 204


# PUT /classes/{id}: a new trainer must be free for every session of the class


def _trainer(client, email: str) -> dict:
    return client.post(
        f"{API}/users",
        json={
            "email": email,
            "full_name": "Otra Entrenadora",
            "role": "trainer",
            "password": "Password123!",
        },
    ).json()


def _class_with_session(client, trainer_id: int, start_time: str, end_time: str) -> dict:
    room = client.post(f"{API}/rooms", json={"name": "Sala 2", "capacity": 20}).json()
    gym_class = client.post(
        f"{API}/classes",
        json={"name": "Pilates", "capacity": 10, "trainer_id": trainer_id, "room_id": room["id"]},
    ).json()
    client.post(
        f"{API}/class-schedules",
        json={
            "class_id": gym_class["id"],
            "day_of_week": 0,
            "start_time": start_time,
            "end_time": end_time,
            "room_id": room["id"],
        },
    )
    return gym_class


def test_class_cannot_move_to_a_trainer_who_is_busy_at_that_time(
    client, gym_class, schedule
) -> None:
    busy = _trainer(client, "ocupada@test.dev")
    _class_with_session(client, busy["id"], "10:30:00", "11:30:00")

    response = client.put(f"{API}/classes/{gym_class.id}", json={"trainer_id": busy["id"]})

    assert response.status_code == 409
    assert response.json() == {
        "detail": "El entrenador ya tiene otra clase en ese horario",
        "code": "conflict",
    }
    assert client.get(f"{API}/classes/{gym_class.id}").json()["trainer_id"] == gym_class.trainer_id


def test_class_can_move_to_a_trainer_who_is_free_at_that_time(client, gym_class, schedule) -> None:
    free = _trainer(client, "libre@test.dev")
    _class_with_session(client, free["id"], "11:00:00", "12:00:00")

    response = client.put(f"{API}/classes/{gym_class.id}", json={"trainer_id": free["id"]})

    assert response.status_code == 200
    assert response.json()["trainer_id"] == free["id"]


def test_updating_a_class_without_changing_its_trainer_is_not_checked(
    client, gym_class, schedule, trainer
) -> None:
    response = client.put(
        f"{API}/classes/{gym_class.id}", json={"trainer_id": trainer.id, "name": "Yoga suave"}
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Yoga suave"
