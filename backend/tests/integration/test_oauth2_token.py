"""OAuth2 Password Flow login and the own-user endpoint (specs/398-oauth2-password-flow.md)."""

from datetime import timedelta

import pytest

from app.core.security import create_access_token, decode_access_token
from app.main import app

TOKEN_URL = "/api/v1/auth/token"
LOGIN_URL = "/api/v1/auth/login"
USERS_ME_URL = "/api/v1/users/me"
AUTH_ME_URL = "/api/v1/auth/me"

# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"


def _bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _form(username: str, password: str = FIXTURE_PASSWORD) -> dict[str, str]:
    return {"username": username, "password": password}


# POST /auth/token


def test_token_with_valid_credentials_returns_a_bearer_token(anon_client, trainer) -> None:
    response = anon_client.post(TOKEN_URL, data=_form(trainer.email))

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    claims = decode_access_token(body["access_token"])
    assert claims["sub"] == str(trainer.id)
    assert claims["role"] == "trainer"


def test_token_response_never_exposes_the_password(anon_client, member) -> None:
    body = anon_client.post(TOKEN_URL, data=_form(member.email)).json()

    assert "password" not in body["user"]
    assert "hashed_password" not in body["user"]


def test_token_opens_a_protected_endpoint(anon_client, member) -> None:
    token = anon_client.post(TOKEN_URL, data=_form(member.email)).json()["access_token"]

    response = anon_client.get(USERS_ME_URL, headers=_bearer(token))

    assert response.status_code == 200
    assert response.json()["id"] == member.id


def test_token_with_wrong_password_returns_401(anon_client, member) -> None:
    response = anon_client.post(TOKEN_URL, data=_form(member.email, "wrong-password"))

    assert response.status_code == 401
    assert response.json() == {"detail": "Email o contraseña incorrectos", "code": "unauthorized"}


@pytest.mark.parametrize("username", ["nadie@test.dev", "not-an-email", "' OR 1=1 --"])
def test_token_gives_the_same_error_whatever_the_username(
    anon_client, member, username: str
) -> None:
    wrong_password = anon_client.post(TOKEN_URL, data=_form(member.email, "nope-nope"))

    response = anon_client.post(TOKEN_URL, data=_form(username))

    assert response.status_code == 401
    assert response.json() == wrong_password.json()


def test_token_for_a_deactivated_account_returns_403(anon_client, db_session, member) -> None:
    member.is_active = False
    db_session.commit()

    response = anon_client.post(TOKEN_URL, data=_form(member.email))

    assert response.status_code == 403
    assert response.json() == {"detail": "La cuenta está desactivada", "code": "forbidden"}


@pytest.mark.parametrize("data", [{"username": "a@test.dev"}, {"password": "password123"}, {}])
def test_token_requires_username_and_password(anon_client, data: dict) -> None:
    response = anon_client.post(TOKEN_URL, data=data)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_token_does_not_accept_json(anon_client, member) -> None:
    response = anon_client.post(TOKEN_URL, json=_form(member.email))

    assert response.status_code == 422


def test_json_login_and_oauth2_token_apply_the_same_rules(anon_client, member) -> None:
    json_login = anon_client.post(
        LOGIN_URL, json={"email": member.email, "password": FIXTURE_PASSWORD}
    )
    form_login = anon_client.post(TOKEN_URL, data=_form(member.email))

    assert json_login.status_code == form_login.status_code == 200
    assert json_login.json()["user"] == form_login.json()["user"]


# GET /users/me


@pytest.mark.parametrize("role", ["member", "trainer", "admin"])
def test_users_me_returns_the_user_of_the_token_for_every_role(
    anon_client, request, role: str
) -> None:
    user = request.getfixturevalue(role)
    token = create_access_token(user.id, user.role.value)

    response = anon_client.get(USERS_ME_URL, headers=_bearer(token))

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user.id
    assert body["email"] == user.email
    assert body["role"] == role
    assert "hashed_password" not in body


def test_users_me_matches_auth_me(anon_client, member) -> None:
    headers = _bearer(create_access_token(member.id, member.role.value))

    assert (
        anon_client.get(USERS_ME_URL, headers=headers).json()
        == anon_client.get(AUTH_ME_URL, headers=headers).json()
    )


def test_users_me_without_token_returns_401_in_the_api_format(anon_client) -> None:
    response = anon_client.get(USERS_ME_URL)

    assert response.status_code == 401
    assert response.json() == {"detail": "Falta el token de acceso", "code": "unauthorized"}


def test_users_me_with_expired_token_returns_401(anon_client, member) -> None:
    token = create_access_token(member.id, "member", expires_delta=timedelta(seconds=-1))

    response = anon_client.get(USERS_ME_URL, headers=_bearer(token))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_users_me_with_tampered_token_returns_401(anon_client, member) -> None:
    token = create_access_token(member.id, "member")
    tampered = token[:-4] + ("AAAA" if not token.endswith("AAAA") else "BBBB")

    response = anon_client.get(USERS_ME_URL, headers=_bearer(tampered))

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_user_by_id_still_works_next_to_users_me(client, member) -> None:
    response = client.get(f"/api/v1/users/{member.id}")

    assert response.status_code == 200
    assert response.json()["id"] == member.id


# OpenAPI: what makes Swagger's Authorize button ask for email and password


def test_openapi_declares_the_oauth2_password_flow() -> None:
    schemes = app.openapi()["components"]["securitySchemes"]

    assert len(schemes) == 1
    (scheme,) = schemes.values()
    assert scheme["type"] == "oauth2"
    assert scheme["flows"]["password"]["tokenUrl"] == "/api/v1/auth/token"


def test_protected_operations_use_the_oauth2_scheme() -> None:
    schema = app.openapi()
    (scheme_name,) = schema["components"]["securitySchemes"]

    protected = schema["paths"]["/api/v1/users/me"]["get"]

    assert protected["security"] == [{scheme_name: []}]
