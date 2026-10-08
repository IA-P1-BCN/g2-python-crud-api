from datetime import timedelta

import pytest

from app.core.security import create_access_token, decode_access_token
from app.models.user import User

REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"

# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"


def _bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _register_payload(**overrides) -> dict:
    return {
        "email": "nueva@test.dev",
        "full_name": "Socia Nueva",
        "password": "Password123!",
    } | overrides


# POST /auth/register


def test_register_creates_a_member_and_returns_a_token(anon_client) -> None:
    response = anon_client.post(REGISTER_URL, json=_register_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "nueva@test.dev"
    assert body["user"]["full_name"] == "Socia Nueva"
    assert body["user"]["role"] == "member"
    assert body["user"]["is_active"] is True

    claims = decode_access_token(body["access_token"])
    assert claims["sub"] == str(body["user"]["id"])
    assert claims["role"] == "member"


def test_register_never_exposes_the_password(anon_client) -> None:
    body = anon_client.post(REGISTER_URL, json=_register_payload()).json()

    assert "password" not in body["user"]
    assert "hashed_password" not in body["user"]


def test_register_stores_the_password_hashed(anon_client, db_session) -> None:
    anon_client.post(REGISTER_URL, json=_register_payload())

    user = db_session.query(User).filter_by(email="nueva@test.dev").one()
    assert user.hashed_password != "password123"


def test_register_cannot_choose_the_role(anon_client) -> None:
    response = anon_client.post(REGISTER_URL, json=_register_payload(role="admin"))

    assert response.status_code == 201
    assert response.json()["user"]["role"] == "member"


def test_register_with_an_existing_email_returns_409(anon_client, member) -> None:
    response = anon_client.post(REGISTER_URL, json=_register_payload(email=member.email))

    assert response.status_code == 409
    assert response.json()["code"] == "conflict"


@pytest.mark.parametrize(
    "overrides",
    [{"email": "not-an-email"}, {"password": "short"}, {"full_name": ""}],
)
def test_register_validates_fields(anon_client, overrides: dict) -> None:
    response = anon_client.post(REGISTER_URL, json=_register_payload(**overrides))

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("missing_field", ["email", "full_name", "password"])
def test_register_requires_email_name_and_password(anon_client, missing_field: str) -> None:
    payload = _register_payload()
    del payload[missing_field]

    response = anon_client.post(REGISTER_URL, json=payload)

    assert response.status_code == 422


# POST /auth/login


def test_login_returns_a_token_for_the_user(anon_client, trainer) -> None:
    response = anon_client.post(
        LOGIN_URL, json={"email": trainer.email, "password": FIXTURE_PASSWORD}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["id"] == trainer.id
    assert body["user"]["role"] == "trainer"

    claims = decode_access_token(body["access_token"])
    assert claims["sub"] == str(trainer.id)
    assert claims["role"] == "trainer"
    assert "exp" in claims


def test_login_after_register(anon_client) -> None:
    anon_client.post(REGISTER_URL, json=_register_payload())

    response = anon_client.post(
        LOGIN_URL, json={"email": "nueva@test.dev", "password": "Password123!"}
    )

    assert response.status_code == 200


def test_login_with_wrong_password_returns_401(anon_client, member) -> None:
    response = anon_client.post(
        LOGIN_URL, json={"email": member.email, "password": "wrong-password"}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_login_with_unknown_email_returns_401(anon_client) -> None:
    response = anon_client.post(
        LOGIN_URL, json={"email": "nadie@test.dev", "password": FIXTURE_PASSWORD}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_login_gives_the_same_error_for_unknown_email_and_wrong_password(
    anon_client, member
) -> None:
    wrong_password = anon_client.post(
        LOGIN_URL, json={"email": member.email, "password": "nope-nope"}
    )
    unknown_email = anon_client.post(LOGIN_URL, json={"email": "nadie@test.dev", "password": "x"})

    assert wrong_password.json() == unknown_email.json()


def test_login_with_a_deactivated_account_returns_403(anon_client, db_session, member) -> None:
    member.is_active = False
    db_session.commit()

    response = anon_client.post(
        LOGIN_URL, json={"email": member.email, "password": FIXTURE_PASSWORD}
    )

    assert response.status_code == 403
    assert response.json()["code"] == "forbidden"


@pytest.mark.parametrize("payload", [{"email": "a@test.dev"}, {"password": "password123"}, {}])
def test_login_requires_email_and_password(anon_client, payload: dict) -> None:
    response = anon_client.post(LOGIN_URL, json=payload)

    assert response.status_code == 422


# GET /auth/me


def test_me_returns_the_user_of_the_token(anon_client, trainer) -> None:
    token = create_access_token(trainer.id, trainer.role.value)

    response = anon_client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == trainer.id
    assert body["email"] == trainer.email
    assert body["role"] == "trainer"
    assert "hashed_password" not in body


def test_me_works_with_the_token_returned_by_login(anon_client, member) -> None:
    login = anon_client.post(LOGIN_URL, json={"email": member.email, "password": FIXTURE_PASSWORD})

    response = anon_client.get(ME_URL, headers=_bearer(login.json()["access_token"]))

    assert response.status_code == 200
    assert response.json()["id"] == member.id


def test_me_without_token_returns_401(anon_client) -> None:
    response = anon_client.get(ME_URL)

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_me_with_expired_token_returns_401(anon_client, member) -> None:
    token = create_access_token(member.id, "member", expires_delta=timedelta(seconds=-1))

    response = anon_client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_me_with_tampered_token_returns_401(anon_client, member) -> None:
    token = create_access_token(member.id, "member")
    tampered = token[:-4] + ("AAAA" if not token.endswith("AAAA") else "BBBB")

    response = anon_client.get(ME_URL, headers=_bearer(tampered))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


@pytest.mark.parametrize("header", ["Bearer not-a-token", "Basic abc123", "not-a-header"])
def test_me_with_malformed_authorization_returns_401(anon_client, header: str) -> None:
    response = anon_client.get(ME_URL, headers={"Authorization": header})

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_me_with_token_of_a_deleted_user_returns_401(anon_client) -> None:
    token = create_access_token(9999, "member")

    response = anon_client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_me_with_token_of_a_deactivated_user_returns_401(anon_client, db_session, member) -> None:
    token = create_access_token(member.id, "member")
    member.is_active = False
    db_session.commit()

    response = anon_client.get(ME_URL, headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"
