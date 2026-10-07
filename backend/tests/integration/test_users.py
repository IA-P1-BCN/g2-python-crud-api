from datetime import UTC, date, datetime

from app.core.security import create_access_token
from app.models.booking import Booking
from app.models.user import User


def _user_payload(email: str = "nuevo@test.dev") -> dict:
    return {
        "email": email,
        "full_name": "Usuario Nuevo",
        "role": "member",
        "password": "password123",
    }


def test_create_and_get_user(client) -> None:
    response = client.post("/api/v1/users", json=_user_payload())
    assert response.status_code == 201

    body = response.json()
    assert body["email"] == "nuevo@test.dev"
    assert "password" not in body
    assert "hashed_password" not in body

    fetched = client.get(f"/api/v1/users/{body['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["full_name"] == "Usuario Nuevo"


def test_duplicate_email_returns_409(client) -> None:
    client.post("/api/v1/users", json=_user_payload())
    response = client.post("/api/v1/users", json=_user_payload())

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


def test_unknown_user_returns_404(client) -> None:
    response = client.get("/api/v1/users/999999")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


def test_list_users_is_paginated(client, member) -> None:
    response = client.get("/api/v1/users", params={"page": 1, "size": 10})
    assert response.status_code == 200

    body = response.json()
    assert body["total"] >= 1
    assert body["page"] == 1
    assert body["size"] == 10
    assert isinstance(body["items"], list)


def test_update_user(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()

    updated = client.put(f"/api/v1/users/{created['id']}", json={"full_name": "Renombrado"})
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Renombrado"


# Sign-offs: DELETE deactivates the account and keeps its history


def test_new_user_has_no_deactivation_date(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()

    assert created["is_active"] is True
    assert created["deactivated_at"] is None


def test_delete_deactivates_the_user_instead_of_removing_it(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()

    deleted = client.delete(f"/api/v1/users/{created['id']}")

    assert deleted.status_code == 204
    fetched = client.get(f"/api/v1/users/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["is_active"] is False
    assert fetched.json()["deactivated_at"] is not None


def test_deactivating_keeps_memberships_and_bookings(
    client, db_session, member, active_membership, schedule
) -> None:
    db_session.add(
        Booking(member_id=member.id, schedule_id=schedule.id, booking_date=date(2026, 10, 5))
    )
    db_session.commit()

    client.delete(f"/api/v1/users/{member.id}")

    assert client.get(f"/api/v1/users/{member.id}/memberships").json()["total"] == 1
    assert client.get(f"/api/v1/users/{member.id}/bookings").json()["total"] == 1


def test_deactivated_user_cannot_log_in(client, member) -> None:
    client.delete(f"/api/v1/users/{member.id}")

    response = client.post(
        "/api/v1/auth/login", json={"email": member.email, "password": "password123"}
    )

    assert response.status_code == 403


def test_update_can_deactivate_and_reactivate(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()
    url = f"/api/v1/users/{created['id']}"

    deactivated = client.put(url, json={"is_active": False}).json()
    reactivated = client.put(url, json={"is_active": True}).json()

    assert deactivated["is_active"] is False
    assert deactivated["deactivated_at"] is not None
    assert reactivated["is_active"] is True
    assert reactivated["deactivated_at"] is None


def test_deactivating_twice_keeps_the_first_date(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload()).json()
    url = f"/api/v1/users/{created['id']}"

    client.delete(url)
    first = client.get(url).json()["deactivated_at"]
    client.delete(url)
    client.put(url, json={"is_active": False})

    assert client.get(url).json()["deactivated_at"] == first


def test_user_created_inactive_has_a_deactivation_date(client) -> None:
    created = client.post("/api/v1/users", json=_user_payload() | {"is_active": False}).json()

    assert created["is_active"] is False
    assert created["deactivated_at"] is not None


def test_deactivating_an_unknown_user_returns_404(client) -> None:
    response = client.delete("/api/v1/users/999999")

    assert response.status_code == 404


def test_admin_cannot_deactivate_their_own_account(anon_client, admin) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(admin.id, admin.role.value)}"}
    url = f"/api/v1/users/{admin.id}"

    deleted = anon_client.delete(url, headers=headers)
    updated = anon_client.put(url, json={"is_active": False}, headers=headers)

    assert deleted.status_code == 409
    assert updated.status_code == 409
    assert anon_client.get(url, headers=headers).json()["is_active"] is True


def test_admin_can_still_edit_their_own_profile(anon_client, admin) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(admin.id, admin.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{admin.id}", json={"full_name": "Admin Renombrada"}, headers=headers
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Admin Renombrada"


def test_member_can_update_own_profile(anon_client, member) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(member.id, member.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{member.id}/profile",
        json={"full_name": "Nombre Actualizado", "email": "actualizado@test.dev"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["full_name"] == "Nombre Actualizado"
    assert response.json()["email"] == "actualizado@test.dev"


def test_member_can_change_own_password(anon_client, member) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(member.id, member.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{member.id}/password",
        json={
            "current_password": "password123",
            "new_password": "nuevaPassword123",
        },
        headers=headers,
    )

    assert response.status_code == 204

    login = anon_client.post(
        "/api/v1/auth/login",
        json={"email": member.email, "password": "nuevaPassword123"},
    )

    assert login.status_code == 200


def test_member_cannot_change_password_with_wrong_current_password(anon_client, member) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(member.id, member.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{member.id}/password",
        json={
            "current_password": "contraseñaIncorrecta123",
            "new_password": "nuevaPassword123",
        },
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["code"] == "business_rule"
    # The session is still valid and the password did not change.
    assert anon_client.get("/api/v1/auth/me", headers=headers).status_code == 200
    login = anon_client.post(
        "/api/v1/auth/login", json={"email": member.email, "password": "password123"}
    )
    assert login.status_code == 200


def test_member_cannot_update_another_member_profile(anon_client, member, admin) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(member.id, member.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{admin.id}/profile",
        json={"full_name": "No Debería Cambiar"},
        headers=headers,
    )

    assert response.status_code == 403


# GET /users filters


def _create(client, email: str, **overrides) -> dict:
    return client.post("/api/v1/users", json=_user_payload(email) | overrides).json()


def _emails(response) -> list[str]:
    return [item["email"] for item in response.json()["items"]]


def test_filter_users_by_role(client, admin, trainer, member) -> None:
    response = client.get("/api/v1/users", params={"role": "trainer"})

    assert _emails(response) == [trainer.email]


def test_filter_users_by_status(client, member) -> None:
    inactive = _create(client, "baja@test.dev")
    client.delete(f"/api/v1/users/{inactive['id']}")

    active = client.get("/api/v1/users", params={"is_active": True})
    signed_off = client.get("/api/v1/users", params={"is_active": False})

    assert _emails(active) == [member.email]
    assert _emails(signed_off) == ["baja@test.dev"]


def test_search_users_by_name_or_email_ignoring_case(client) -> None:
    _create(client, "laura@test.dev", full_name="Laura Gómez")
    _create(client, "pablo@test.dev", full_name="Pablo Ruiz")

    by_name = client.get("/api/v1/users", params={"search": "gómez"})
    by_email = client.get("/api/v1/users", params={"search": "PABLO@"})
    no_match = client.get("/api/v1/users", params={"search": "nadie"})

    assert _emails(by_name) == ["laura@test.dev"]
    assert _emails(by_email) == ["pablo@test.dev"]
    assert no_match.json()["total"] == 0


def test_filter_users_by_signup_date(client, db_session) -> None:
    old = _create(client, "antigua@test.dev")
    _create(client, "reciente@test.dev")
    db_session.get(User, old["id"]).created_at = datetime(2026, 1, 15, 12, 0, tzinfo=UTC)
    db_session.commit()

    january = client.get(
        "/api/v1/users", params={"created_from": "2026-01-01", "created_to": "2026-01-31"}
    )
    same_day = client.get(
        "/api/v1/users", params={"created_from": "2026-01-15", "created_to": "2026-01-15"}
    )
    since_february = client.get("/api/v1/users", params={"created_from": "2026-02-01"})

    assert _emails(january) == ["antigua@test.dev"]
    assert _emails(same_day) == ["antigua@test.dev"]
    assert _emails(since_february) == ["reciente@test.dev"]


def test_filter_users_by_sign_off_date(client, db_session) -> None:
    march = _create(client, "marzo@test.dev")
    today = _create(client, "hoy@test.dev")
    _create(client, "activa@test.dev")
    for user in (march, today):
        client.delete(f"/api/v1/users/{user['id']}")
    db_session.get(User, march["id"]).deactivated_at = datetime(2026, 3, 10, 9, 0, tzinfo=UTC)
    db_session.commit()

    in_march = client.get(
        "/api/v1/users",
        params={"deactivated_from": "2026-03-01", "deactivated_to": "2026-03-31"},
    )
    any_sign_off = client.get("/api/v1/users", params={"deactivated_from": "2026-01-01"})

    assert _emails(in_march) == ["marzo@test.dev"]
    assert _emails(any_sign_off) == ["marzo@test.dev", "hoy@test.dev"]


def test_user_filters_can_be_combined_and_paginated(client, member, trainer) -> None:
    for index in range(3):
        _create(client, f"socia{index}@test.dev", full_name=f"Socia {index}")

    response = client.get(
        "/api/v1/users",
        params={"role": "member", "search": "socia", "is_active": True, "page": 2, "size": 2},
    )

    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert _emails(response) == ["socia2@test.dev"]


def test_invalid_user_filters_return_422(client) -> None:
    invalid_role = client.get("/api/v1/users", params={"role": "superuser"})
    invalid_date = client.get("/api/v1/users", params={"created_from": "ayer"})

    assert invalid_role.status_code == 422
    assert invalid_date.status_code == 422


def test_trainer_filters_still_see_members_only(anon_client, trainer, member, admin) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(trainer.id, trainer.role.value)}"}

    response = anon_client.get("/api/v1/users", params={"is_active": True}, headers=headers)

    assert _emails(response) == [member.email]
