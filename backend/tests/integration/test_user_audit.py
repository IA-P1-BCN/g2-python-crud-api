"""Who created and last changed each user, and when (specs/410-user-audit-trail.md)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.core.security import create_access_token
from app.models.user import User

API = "/api/v1"
NEW_PASSWORD = "Password123!"


def _auth(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}


def _audit(client, user_id: int, headers: dict[str, str]) -> dict:
    response = client.get(f"{API}/users/{user_id}/audit", headers=headers)
    assert response.status_code == 200, response.text
    return response.json()


def _person(user: User) -> dict:
    return {"id": user.id, "full_name": user.full_name, "email": user.email}


def _is_recent(value: str) -> bool:
    moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=UTC)
    return datetime.now(UTC) - moment < timedelta(minutes=1)


def _create(client, admin: User, email: str = "nueva@test.dev") -> dict:
    response = client.post(
        f"{API}/users",
        json={"email": email, "full_name": "Socia Nueva", "password": NEW_PASSWORD},
        headers=_auth(admin),
    )
    assert response.status_code == 201
    return response.json()


# Creation


def test_a_user_created_by_an_admin_records_the_admin(anon_client, admin) -> None:
    created = _create(anon_client, admin)

    audit = _audit(anon_client, created["id"], _auth(admin))

    assert audit["user_id"] == created["id"]
    assert audit["created_at"] == created["created_at"]
    assert audit["created_by"] == _person(admin)
    assert audit["updated_at"] is None
    assert audit["updated_by"] is None


def test_a_user_who_signs_up_is_their_own_creator(anon_client, admin) -> None:
    registered = anon_client.post(
        f"{API}/auth/register",
        json={"email": "socia@test.dev", "full_name": "Socia Uno", "password": NEW_PASSWORD},
    ).json()["user"]

    audit = _audit(anon_client, registered["id"], _auth(admin))

    assert audit["created_by"] == {
        "id": registered["id"],
        "full_name": "Socia Uno",
        "email": "socia@test.dev",
    }
    assert audit["updated_by"] is None


def test_users_from_before_the_audit_have_it_empty(anon_client, admin, member) -> None:
    audit = _audit(anon_client, member.id, _auth(admin))

    assert audit["created_by"] is None
    assert audit["updated_at"] is None
    assert audit["updated_by"] is None


# Changes


def test_an_admin_edit_records_the_admin_and_the_time(anon_client, admin, member) -> None:
    anon_client.put(f"{API}/users/{member.id}", json={"full_name": "Otro"}, headers=_auth(admin))

    audit = _audit(anon_client, member.id, _auth(admin))

    assert audit["updated_by"] == _person(admin)
    assert _is_recent(audit["updated_at"])
    assert audit["created_by"] is None


def test_a_profile_change_records_who_made_it(anon_client, admin, member) -> None:
    response = anon_client.put(
        f"{API}/users/{member.id}/profile", json={"full_name": "Mi Nombre"}, headers=_auth(member)
    )
    assert response.status_code == 200

    assert _audit(anon_client, member.id, _auth(admin))["updated_by"]["id"] == member.id


def test_an_admin_changing_a_profile_is_recorded_as_the_admin(anon_client, admin, member) -> None:
    anon_client.put(
        f"{API}/users/{member.id}/profile", json={"full_name": "Por Admin"}, headers=_auth(admin)
    )

    assert _audit(anon_client, member.id, _auth(admin))["updated_by"]["id"] == admin.id


def test_a_password_change_records_who_made_it(anon_client, admin, member) -> None:
    response = anon_client.put(
        f"{API}/users/{member.id}/password",
        json={"current_password": "password123", "new_password": NEW_PASSWORD},
        headers=_auth(member),
    )
    assert response.status_code == 204

    audit = _audit(anon_client, member.id, _auth(admin))
    assert audit["updated_by"]["id"] == member.id
    assert _is_recent(audit["updated_at"])


def test_a_sign_off_records_the_admin(anon_client, admin, member) -> None:
    response = anon_client.delete(f"{API}/users/{member.id}", headers=_auth(admin))
    assert response.status_code == 204

    assert _audit(anon_client, member.id, _auth(admin))["updated_by"]["id"] == admin.id


def test_only_the_last_change_is_kept(anon_client, admin, member) -> None:
    anon_client.put(f"{API}/users/{member.id}", json={"full_name": "Uno"}, headers=_auth(admin))
    anon_client.put(
        f"{API}/users/{member.id}/profile", json={"full_name": "Dos"}, headers=_auth(member)
    )

    assert _audit(anon_client, member.id, _auth(admin))["updated_by"]["id"] == member.id


@pytest.mark.parametrize(
    ("method", "path", "body"),
    [
        ("PUT", "/users/{id}", {"email": "taken@test.dev"}),
        ("PUT", "/users/{id}/profile", {"email": "taken@test.dev"}),
        (
            "PUT",
            "/users/{id}/password",
            {"current_password": "wrong-password", "new_password": NEW_PASSWORD},
        ),
    ],
)
def test_a_failed_change_leaves_the_audit_untouched(
    anon_client, admin, member, method: str, path: str, body: dict
) -> None:
    _create(anon_client, admin, email="taken@test.dev")

    response = anon_client.request(
        method, f"{API}{path.format(id=member.id)}", json=body, headers=_auth(admin)
    )

    assert response.status_code in (400, 409)
    audit = _audit(anon_client, member.id, _auth(admin))
    assert audit["updated_at"] is None
    assert audit["updated_by"] is None


def test_the_audit_cannot_be_set_from_the_request_body(anon_client, admin, member) -> None:
    created = anon_client.post(
        f"{API}/users",
        json={
            "email": "nueva@test.dev",
            "full_name": "Socia Nueva",
            "password": NEW_PASSWORD,
            "created_by_id": member.id,
        },
        headers=_auth(admin),
    ).json()

    assert _audit(anon_client, created["id"], _auth(admin))["created_by"]["id"] == admin.id


# Who can read it


@pytest.mark.parametrize("role", ["member", "trainer"])
def test_only_admins_can_read_the_audit(anon_client, request, member, role: str) -> None:
    caller = request.getfixturevalue(role)

    response = anon_client.get(f"{API}/users/{member.id}/audit", headers=_auth(caller))

    assert response.status_code == 403


def test_the_audit_needs_a_session(anon_client, member) -> None:
    assert anon_client.get(f"{API}/users/{member.id}/audit").status_code == 401


def test_the_audit_of_an_unknown_user_returns_404(anon_client, admin) -> None:
    response = anon_client.get(f"{API}/users/999999/audit", headers=_auth(admin))

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


@pytest.mark.parametrize("path", ["/users/{id}", "/users/me", "/auth/me"])
def test_user_responses_do_not_include_the_audit_fields(anon_client, admin, path: str) -> None:
    body = anon_client.get(f"{API}{path.format(id=admin.id)}", headers=_auth(admin)).json()

    assert not {"created_by_id", "updated_by_id", "updated_at", "created_by"} & set(body)


def test_the_list_of_users_does_not_include_the_audit_fields(anon_client, admin, member) -> None:
    items = anon_client.get(f"{API}/users", headers=_auth(admin)).json()["items"]

    assert all("updated_by_id" not in item and "created_by_id" not in item for item in items)
