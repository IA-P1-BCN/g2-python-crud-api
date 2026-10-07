from datetime import date

from app.core.security import create_access_token
from app.models.booking import Booking


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

    updated = client.put(
        f"/api/v1/users/{created['id']}", json={"full_name": "Renombrado"}
    )
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

def test_member_cannot_change_password_with_wrong_current_password(
    anon_client, member
) -> None:
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


def test_member_cannot_update_another_member_profile(
    anon_client, member, admin
) -> None:
    headers = {"Authorization": f"Bearer {create_access_token(member.id, member.role.value)}"}

    response = anon_client.put(
        f"/api/v1/users/{admin.id}/profile",
        json={"full_name": "No Debería Cambiar"},
        headers=headers,
    )

    assert response.status_code == 403
