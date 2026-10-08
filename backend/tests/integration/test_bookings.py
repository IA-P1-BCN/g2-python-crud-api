from datetime import date


def _create_schedule(client, trainer, room, capacity: int = 5) -> int:
    gym_class = client.post(
        "/api/v1/classes",
        json={
            "name": "Yoga",
            "capacity": capacity,
            "trainer_id": trainer.id,
            "room_id": room.id,
        },
    ).json()
    schedule = client.post(
        "/api/v1/class-schedules",
        json={
            "class_id": gym_class["id"],
            "day_of_week": 0,
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "room_id": room.id,
        },
    ).json()
    return schedule["id"]


def test_full_booking_flow_and_cancel(
    client, member, plan, trainer, room, next_date_for_weekday
) -> None:
    schedule_id = _create_schedule(client, trainer, room)
    booking_date = next_date_for_weekday(0).isoformat()

    membership = client.post(
        "/api/v1/memberships",
        json={"user_id": member.id, "plan_id": plan.id, "start_date": date.today().isoformat()},
    )
    assert membership.status_code == 201

    created = client.post(
        "/api/v1/bookings",
        json={"member_id": member.id, "schedule_id": schedule_id, "booking_date": booking_date},
    )
    assert created.status_code == 201
    booking_id = created.json()["id"]

    cancelled = client.delete(f"/api/v1/bookings/{booking_id}")
    assert cancelled.status_code == 204

    fetched = client.get(f"/api/v1/bookings/{booking_id}")
    assert fetched.json()["status"] == "cancelled"


def test_booking_without_membership_returns_400(
    client, member, schedule, next_date_for_weekday
) -> None:
    response = client.post(
        "/api/v1/bookings",
        json={
            "member_id": member.id,
            "schedule_id": schedule.id,
            "booking_date": next_date_for_weekday(schedule.day_of_week).isoformat(),
        },
    )

    assert response.status_code == 400
    assert response.json()["code"] == "business_rule"


def test_booking_date_must_match_schedule_weekday(
    client, member, plan, trainer, room, next_date_for_weekday
) -> None:
    schedule_id = _create_schedule(client, trainer, room)
    client.post(
        "/api/v1/memberships",
        json={"user_id": member.id, "plan_id": plan.id, "start_date": date.today().isoformat()},
    )
    wrong_date = next_date_for_weekday(1).isoformat()

    response = client.post(
        "/api/v1/bookings",
        json={"member_id": member.id, "schedule_id": schedule_id, "booking_date": wrong_date},
    )

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_booking_invalid_schedule_returns_404(client, member) -> None:
    response = client.post(
        "/api/v1/bookings",
        json={
            "member_id": member.id,
            "schedule_id": 999999,
            "booking_date": date.today().isoformat(),
        },
    )

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_user_bookings_relationship_endpoint(client, member, active_membership) -> None:
    response = client.get(f"/api/v1/users/{member.id}/bookings")
    assert response.status_code == 200
    assert "items" in response.json()


def test_export_members_csv(client, member) -> None:
    response = client.get("/api/v1/export/members.csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "email" in response.text
    assert member.email in response.text
