from datetime import date, timedelta

from app.models.membership_plan import MembershipPlan


def test_create_membership_computes_end_date_and_status(client, member, plan) -> None:
    response = client.post(
        "/api/v1/memberships",
        json={
            "user_id": member.id,
            "plan_id": plan.id,
            "start_date": date.today().isoformat(),
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] == member.id
    assert body["plan_id"] == plan.id
    assert body["start_date"] == date.today().isoformat()
    assert body["end_date"] == (
        date.today() + timedelta(days=plan.duration_days)
    ).isoformat()
    assert body["status"] == "active"


def test_create_membership_in_the_past_is_expired(client, member, plan) -> None:
    start = date.today() - timedelta(days=plan.duration_days + 1)
    response = client.post(
        "/api/v1/memberships",
        json={"user_id": member.id, "plan_id": plan.id, "start_date": start.isoformat()},
    )

    assert response.status_code == 201
    assert response.json()["status"] == "expired"


def test_create_membership_unknown_user_returns_404(client, plan) -> None:
    response = client.post(
        "/api/v1/memberships",
        json={
            "user_id": 9999,
            "plan_id": plan.id,
            "start_date": date.today().isoformat(),
        },
    )

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_create_membership_unknown_plan_returns_404(client, member) -> None:
    response = client.post(
        "/api/v1/memberships",
        json={
            "user_id": member.id,
            "plan_id": 9999,
            "start_date": date.today().isoformat(),
        },
    )

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_create_membership_inactive_plan_returns_400(client, member, db_session) -> None:
    inactive = MembershipPlan(
        name="Inactivo", price_cents=1000, duration_days=10, is_active=False
    )
    db_session.add(inactive)
    db_session.commit()
    db_session.refresh(inactive)

    response = client.post(
        "/api/v1/memberships",
        json={
            "user_id": member.id,
            "plan_id": inactive.id,
            "start_date": date.today().isoformat(),
        },
    )

    assert response.status_code == 400
    assert response.json()["code"] == "business_rule"


def test_get_membership_not_found_returns_404(client) -> None:
    response = client.get("/api/v1/memberships/9999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_list_memberships_filters_by_user(client, active_membership, member) -> None:
    response = client.get("/api/v1/memberships", params={"user_id": member.id})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert all(item["user_id"] == member.id for item in body["items"])


def test_update_membership_cancels(client, active_membership) -> None:
    response = client.put(
        f"/api/v1/memberships/{active_membership.id}", json={"status": "cancelled"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_update_membership_recomputes_end_date(client, active_membership, plan) -> None:
    new_start = active_membership.start_date + timedelta(days=5)
    response = client.put(
        f"/api/v1/memberships/{active_membership.id}",
        json={"start_date": new_start.isoformat()},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["start_date"] == new_start.isoformat()
    assert body["end_date"] == (new_start + timedelta(days=plan.duration_days)).isoformat()
    assert body["end_date"] >= body["start_date"]


def test_delete_membership(client, active_membership) -> None:
    deleted = client.delete(f"/api/v1/memberships/{active_membership.id}")

    assert deleted.status_code == 204
    assert client.get(f"/api/v1/memberships/{active_membership.id}").status_code == 404


def test_delete_membership_with_payments_returns_409(client, member, active_membership) -> None:
    payment = client.post(
        "/api/v1/payments",
        json={"user_id": member.id, "membership_id": active_membership.id, "amount_cents": 3999},
    ).json()

    response = client.delete(f"/api/v1/memberships/{active_membership.id}")

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"
    assert client.get(f"/api/v1/memberships/{active_membership.id}").status_code == 200
    assert client.get(f"/api/v1/payments/{payment['id']}").status_code == 200
