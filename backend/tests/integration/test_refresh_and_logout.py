"""Refresh tokens and logout with revoked tokens (specs/408-refresh-tokens-and-logout.md)."""

from datetime import timedelta

import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from app.models.revoked_token import RevokedToken

API = "/api/v1"
LOGIN_URL = f"{API}/auth/login"
REFRESH_URL = f"{API}/auth/refresh"
LOGOUT_URL = f"{API}/auth/logout"
ME_URL = f"{API}/users/me"

# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"


def _bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _login(client, user) -> dict:
    response = client.post(LOGIN_URL, json={"email": user.email, "password": FIXTURE_PASSWORD})
    assert response.status_code == 200
    return response.json()


# Every way of opening a session returns both tokens


def test_json_login_returns_an_access_and_a_refresh_token(anon_client, member) -> None:
    body = _login(anon_client, member)

    assert decode_access_token(body["access_token"])["sub"] == str(member.id)
    assert decode_refresh_token(body["refresh_token"])["sub"] == str(member.id)
    assert body["token_type"] == "bearer"


def test_oauth2_token_returns_a_refresh_token(anon_client, member) -> None:
    body = anon_client.post(
        f"{API}/auth/token", data={"username": member.email, "password": FIXTURE_PASSWORD}
    ).json()

    assert decode_refresh_token(body["refresh_token"])["sub"] == str(member.id)


def test_register_returns_a_refresh_token(anon_client) -> None:
    body = anon_client.post(
        f"{API}/auth/register",
        json={"email": "nueva@test.dev", "full_name": "Socia Nueva", "password": "Password123!"},
    ).json()

    assert decode_refresh_token(body["refresh_token"])["sub"] == str(body["user"]["id"])


def test_each_session_gets_its_own_tokens(anon_client, member) -> None:
    first = _login(anon_client, member)
    second = _login(anon_client, member)

    assert first["access_token"] != second["access_token"]
    assert first["refresh_token"] != second["refresh_token"]


# POST /auth/refresh


def test_refresh_returns_a_new_access_token_that_works(anon_client, member) -> None:
    session = _login(anon_client, member)

    response = anon_client.post(REFRESH_URL, json={"refresh_token": session["refresh_token"]})

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"] != session["access_token"]
    assert body["refresh_token"] == session["refresh_token"]
    assert body["user"]["id"] == member.id
    assert anon_client.get(ME_URL, headers=_bearer(body["access_token"])).status_code == 200


def test_refresh_keeps_the_role_in_the_new_access_token(anon_client, admin) -> None:
    session = _login(anon_client, admin)

    body = anon_client.post(REFRESH_URL, json={"refresh_token": session["refresh_token"]}).json()

    assert decode_access_token(body["access_token"])["role"] == "admin"


def test_refresh_with_an_expired_refresh_token_returns_401(anon_client, member) -> None:
    token = create_refresh_token(member.id, expires_delta=timedelta(seconds=-1))

    response = anon_client.post(REFRESH_URL, json={"refresh_token": token})

    assert response.status_code == 401
    assert response.json() == {"detail": "El token ha caducado", "code": "unauthorized"}


def test_refresh_with_an_access_token_returns_401(anon_client, member) -> None:
    session = _login(anon_client, member)

    response = anon_client.post(REFRESH_URL, json={"refresh_token": session["access_token"]})

    assert response.status_code == 401
    assert response.json() == {"detail": "Token inválido", "code": "unauthorized"}


def test_refresh_for_a_deactivated_account_returns_401(anon_client, db_session, member) -> None:
    session = _login(anon_client, member)
    member.is_active = False
    db_session.commit()

    response = anon_client.post(REFRESH_URL, json={"refresh_token": session["refresh_token"]})

    assert response.status_code == 401
    assert response.json() == {"detail": "La cuenta está desactivada", "code": "unauthorized"}


@pytest.mark.parametrize("payload", [{}, {"refresh_token": ""}, {"token": "x"}])
def test_refresh_requires_the_refresh_token(anon_client, payload: dict) -> None:
    response = anon_client.post(REFRESH_URL, json=payload)

    assert response.status_code == 422


def test_refresh_with_a_garbage_token_returns_401(anon_client) -> None:
    response = anon_client.post(REFRESH_URL, json={"refresh_token": "not-a-token"})

    assert response.status_code == 401


# A refresh token never opens an endpoint


def test_a_refresh_token_does_not_work_as_an_access_token(anon_client, member) -> None:
    session = _login(anon_client, member)

    response = anon_client.get(ME_URL, headers=_bearer(session["refresh_token"]))

    assert response.status_code == 401
    assert response.json() == {"detail": "Token inválido", "code": "unauthorized"}


# POST /auth/logout


def test_logout_revokes_the_access_token(anon_client, member) -> None:
    session = _login(anon_client, member)
    headers = _bearer(session["access_token"])

    response = anon_client.post(LOGOUT_URL, headers=headers)

    assert response.status_code == 204
    after = anon_client.get(ME_URL, headers=headers)
    assert after.status_code == 401
    assert after.json() == {"detail": "El token ha sido revocado", "code": "unauthorized"}


def test_logout_without_the_refresh_token_leaves_it_alive(anon_client, member) -> None:
    session = _login(anon_client, member)
    anon_client.post(LOGOUT_URL, headers=_bearer(session["access_token"]))

    response = anon_client.post(REFRESH_URL, json={"refresh_token": session["refresh_token"]})

    assert response.status_code == 200


def test_logout_with_the_refresh_token_revokes_it_too(anon_client, member) -> None:
    session = _login(anon_client, member)

    logout = anon_client.post(
        LOGOUT_URL,
        json={"refresh_token": session["refresh_token"]},
        headers=_bearer(session["access_token"]),
    )

    assert logout.status_code == 204
    response = anon_client.post(REFRESH_URL, json={"refresh_token": session["refresh_token"]})
    assert response.status_code == 401
    assert response.json() == {"detail": "El token ha sido revocado", "code": "unauthorized"}


def test_logout_with_the_refresh_token_of_another_user_revokes_nothing(
    anon_client, db_session, member, trainer
) -> None:
    mine = _login(anon_client, member)
    theirs = _login(anon_client, trainer)

    response = anon_client.post(
        LOGOUT_URL,
        json={"refresh_token": theirs["refresh_token"]},
        headers=_bearer(mine["access_token"]),
    )

    assert response.status_code == 401
    assert db_session.query(RevokedToken).count() == 0
    assert anon_client.get(ME_URL, headers=_bearer(mine["access_token"])).status_code == 200
    refreshed = anon_client.post(REFRESH_URL, json={"refresh_token": theirs["refresh_token"]})
    assert refreshed.status_code == 200


def test_logout_without_a_session_returns_401(anon_client) -> None:
    response = anon_client.post(LOGOUT_URL)

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_logout_twice_with_the_same_token_returns_401(anon_client, member) -> None:
    headers = _bearer(_login(anon_client, member)["access_token"])
    anon_client.post(LOGOUT_URL, headers=headers)

    response = anon_client.post(LOGOUT_URL, headers=headers)

    assert response.status_code == 401
    assert response.json()["detail"] == "El token ha sido revocado"


def test_logout_only_closes_that_session(anon_client, member, trainer) -> None:
    first = _login(anon_client, member)
    second = _login(anon_client, member)
    other_user = _login(anon_client, trainer)

    anon_client.post(LOGOUT_URL, headers=_bearer(first["access_token"]))

    assert anon_client.get(ME_URL, headers=_bearer(second["access_token"])).status_code == 200
    assert anon_client.get(ME_URL, headers=_bearer(other_user["access_token"])).status_code == 200


def test_logout_stores_only_the_token_id(anon_client, db_session, member) -> None:
    session = _login(anon_client, member)

    anon_client.post(
        LOGOUT_URL,
        json={"refresh_token": session["refresh_token"]},
        headers=_bearer(session["access_token"]),
    )

    rows = db_session.query(RevokedToken).all()
    assert {row.jti for row in rows} == {
        decode_access_token(session["access_token"])["jti"],
        decode_refresh_token(session["refresh_token"])["jti"],
    }
    assert all(row.user_id == member.id for row in rows)
    assert all(session["access_token"] not in row.jti for row in rows)


def test_a_token_created_by_hand_is_revoked_like_any_other(anon_client, member) -> None:
    token = create_access_token(member.id, member.role.value)
    anon_client.post(LOGOUT_URL, headers=_bearer(token))

    assert anon_client.get(ME_URL, headers=_bearer(token)).status_code == 401
