"""The whole gym flow through the API, each step with the session of the role that does it.

Admin sets up the gym, a trainer publishes a class, a new member registers, books and cancels.
Nothing is written straight to the database except the first admin, who cannot register.
"""

from datetime import date, timedelta

import pytest

API = "/api/v1"
PASSWORD = "Password123!"


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _login(client, email: str, password: str) -> dict[str, str]:
    response = client.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return _auth(response.json()["access_token"])


def _create(client, path: str, headers: dict[str, str], payload: dict) -> dict:
    response = client.post(f"{API}{path}", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def _available(client, schedule_id: int, on_date: date) -> int:
    response = client.get(
        f"{API}/class-schedules/{schedule_id}/availability",
        params={"on_date": on_date.isoformat()},
    )
    return response.json()["available"]


@pytest.fixture()
def gym(anon_client, admin) -> dict:
    """A gym set up through the API: plan, room, trainer, class and a session in a week."""
    as_admin = _login(anon_client, admin.email, "password123")
    session_date = date.today() + timedelta(days=7)

    plan = _create(
        anon_client,
        "/membership-plans",
        as_admin,
        {"name": "Mensual", "price_cents": 3999, "duration_days": 30},
    )
    room = _create(anon_client, "/rooms", as_admin, {"name": "Sala Zen", "capacity": 12})
    trainer = _create(
        anon_client,
        "/users",
        as_admin,
        {
            "email": "entrenadora@test.dev",
            "full_name": "Entrenadora Nueva",
            "role": "trainer",
            "password": PASSWORD,
        },
    )

    as_trainer = _login(anon_client, trainer["email"], PASSWORD)
    gym_class = _create(
        anon_client,
        "/classes",
        as_trainer,
        {"name": "Yoga", "capacity": 1, "trainer_id": trainer["id"], "room_id": room["id"]},
    )
    schedule = _create(
        anon_client,
        "/class-schedules",
        as_trainer,
        {
            "class_id": gym_class["id"],
            "day_of_week": session_date.weekday(),
            "start_time": "18:00:00",
            "end_time": "19:00:00",
            "room_id": room["id"],
        },
    )
    return {
        "as_admin": as_admin,
        "as_trainer": as_trainer,
        "plan": plan,
        "schedule": schedule,
        "session_date": session_date,
    }


def _register(client, email: str) -> tuple[dict, dict[str, str]]:
    response = client.post(
        f"{API}/auth/register",
        json={"email": email, "full_name": "Socia Nueva", "password": PASSWORD},
    )
    assert response.status_code == 201
    body = response.json()
    return body["user"], _auth(body["access_token"])


def _assign_membership(client, gym: dict, user: dict) -> dict:
    return _create(
        client,
        "/memberships",
        gym["as_admin"],
        {
            "user_id": user["id"],
            "plan_id": gym["plan"]["id"],
            "start_date": date.today().isoformat(),
        },
    )


def _book(client, gym: dict, user: dict, headers: dict[str, str]):
    return client.post(
        f"{API}/bookings",
        json={
            "member_id": user["id"],
            "schedule_id": gym["schedule"]["id"],
            "booking_date": gym["session_date"].isoformat(),
        },
        headers=headers,
    )


def test_member_registers_gets_a_plan_books_and_cancels(anon_client, gym) -> None:
    schedule_id = gym["schedule"]["id"]
    session_date = gym["session_date"]
    member, as_member = _register(anon_client, "socia@test.dev")

    # Without a membership the member cannot book yet.
    assert _book(anon_client, gym, member, as_member).status_code == 400

    membership = _assign_membership(anon_client, gym, member)
    assert membership["status"] == "active"

    booked = _book(anon_client, gym, member, as_member)
    assert booked.status_code == 201
    booking = booked.json()
    assert booking["status"] == "confirmed"
    assert _available(anon_client, schedule_id, session_date) == 0

    # The member sees it on their home screen and the trainer in the session list.
    dashboard = anon_client.get(f"{API}/me/dashboard", headers=as_member).json()
    assert dashboard["membership"]["plan_name"] == "Mensual"
    assert [item["booking_id"] for item in dashboard["upcoming_bookings"]] == [booking["id"]]
    assert dashboard["upcoming_bookings"][0]["class_name"] == "Yoga"
    assert dashboard["upcoming_bookings"][0]["room_name"] == "Sala Zen"
    enrolled = anon_client.get(
        f"{API}/class-schedules/{schedule_id}/bookings", headers=gym["as_trainer"]
    ).json()
    assert [item["member_id"] for item in enrolled["items"]] == [member["id"]]

    cancelled = anon_client.delete(f"{API}/bookings/{booking['id']}", headers=as_member)
    assert cancelled.status_code == 204
    assert _available(anon_client, schedule_id, session_date) == 1

    # The booking is kept as cancelled, and it leaves the member's home screen.
    history = anon_client.get(f"{API}/users/{member['id']}/bookings", headers=as_member).json()
    assert [item["status"] for item in history["items"]] == ["cancelled"]
    dashboard = anon_client.get(f"{API}/me/dashboard", headers=as_member).json()
    assert dashboard["upcoming_bookings"] == []


def test_the_spot_freed_by_one_member_goes_to_the_next(anon_client, gym) -> None:
    first, as_first = _register(anon_client, "primera@test.dev")
    second, as_second = _register(anon_client, "segunda@test.dev")
    _assign_membership(anon_client, gym, first)
    _assign_membership(anon_client, gym, second)

    booking = _book(anon_client, gym, first, as_first).json()
    full = _book(anon_client, gym, second, as_second)
    assert full.status_code == 409
    assert full.json()["code"] == "conflict"

    anon_client.delete(f"{API}/bookings/{booking['id']}", headers=as_first)

    assert _book(anon_client, gym, second, as_second).status_code == 201


def test_a_member_cannot_book_or_cancel_for_another_member(anon_client, gym) -> None:
    owner, as_owner = _register(anon_client, "duena@test.dev")
    other, as_other = _register(anon_client, "otra@test.dev")
    _assign_membership(anon_client, gym, owner)
    booking = _book(anon_client, gym, owner, as_owner).json()

    assert _book(anon_client, gym, owner, as_other).status_code == 403
    assert (
        anon_client.delete(f"{API}/bookings/{booking['id']}", headers=as_other).status_code == 403
    )
    assert anon_client.get(f"{API}/bookings/{booking['id']}", headers=as_owner).status_code == 200


def test_the_admin_sees_the_new_member_with_their_plan(anon_client, gym) -> None:
    member, _ = _register(anon_client, "socia@test.dev")
    _assign_membership(anon_client, gym, member)

    members = anon_client.get(f"{API}/admin/members", headers=gym["as_admin"]).json()

    assert members["total"] == 1
    assert members["items"][0]["email"] == "socia@test.dev"
    assert members["items"][0]["membership"]["plan_name"] == "Mensual"
