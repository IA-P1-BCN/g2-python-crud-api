"""Login attempts limited per client IP (specs/409-login-rate-limiting.md)."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

API = "/api/v1"
LOGIN_URL = f"{API}/auth/login"
TOKEN_URL = f"{API}/auth/token"

# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"
# Whatever each person has in their .env
LIMIT = settings.login_rate_limit_attempts


def _json_login(client, email: str, password: str = FIXTURE_PASSWORD):
    return client.post(LOGIN_URL, json={"email": email, "password": password})


def _form_login(client, email: str, password: str = FIXTURE_PASSWORD):
    return client.post(TOKEN_URL, data={"username": email, "password": password})


@pytest.fixture()
def other_ip_client(anon_client) -> Generator[TestClient, None, None]:
    """A second client from another IP, sharing the test database of `anon_client`."""
    with TestClient(app, client=("203.0.113.7", 50000)) as client:
        yield client


def test_the_attempts_within_the_limit_are_answered_normally(anon_client, member) -> None:
    statuses = [_json_login(anon_client, member.email, "wrong").status_code for _ in range(LIMIT)]

    assert statuses == [401] * LIMIT


def test_the_attempt_over_the_limit_returns_429(anon_client, member) -> None:
    for _ in range(LIMIT):
        _json_login(anon_client, member.email, "wrong")

    response = _json_login(anon_client, member.email, "wrong")

    assert response.status_code == 429
    body = response.json()
    assert body["code"] == "too_many_requests"
    assert body["detail"].startswith("Demasiados intentos de inicio de sesión")
    retry_after = int(response.headers["Retry-After"])
    assert 1 <= retry_after <= settings.login_rate_limit_window_seconds
    assert f"{retry_after} segundos" in body["detail"]


def test_over_the_limit_even_the_right_password_is_refused(anon_client, member) -> None:
    for _ in range(LIMIT):
        _json_login(anon_client, member.email, "wrong")

    response = _json_login(anon_client, member.email)

    assert response.status_code == 429
    assert "access_token" not in response.json()


def test_successful_logins_count_too(anon_client, member) -> None:
    for _ in range(LIMIT):
        assert _json_login(anon_client, member.email).status_code == 200

    assert _json_login(anon_client, member.email).status_code == 429


def test_both_login_endpoints_share_the_count(anon_client, member) -> None:
    for _ in range(3):
        _json_login(anon_client, member.email, "wrong")
    for _ in range(2):
        _form_login(anon_client, member.email, "wrong")

    assert _form_login(anon_client, member.email).status_code == 429
    assert _json_login(anon_client, member.email).status_code == 429


def test_another_ip_is_not_affected(anon_client, other_ip_client, member) -> None:
    for _ in range(LIMIT + 1):
        _json_login(anon_client, member.email, "wrong")

    response = _json_login(other_ip_client, member.email)

    assert response.status_code == 200


def test_the_rest_of_the_api_is_not_limited(anon_client, member) -> None:
    for _ in range(LIMIT + 1):
        _json_login(anon_client, member.email, "wrong")

    register = anon_client.post(
        f"{API}/auth/register",
        json={"email": "nueva@test.dev", "full_name": "Socia Nueva", "password": "Password123!"},
    )
    plans = anon_client.get(f"{API}/membership-plans")

    assert register.status_code == 201
    assert plans.status_code == 200


def test_reaching_the_limit_is_logged_with_the_ip(anon_client, member, caplog) -> None:
    for _ in range(LIMIT):
        _json_login(anon_client, member.email, "wrong")

    with caplog.at_level("WARNING"):
        _json_login(anon_client, member.email, "wrong")

    assert any(
        "Login rate limit reached for testclient" in record.getMessage()
        for record in caplog.records
    )


def test_swagger_documents_the_429_on_both_logins() -> None:
    paths = app.openapi()["paths"]

    for path in (LOGIN_URL, TOKEN_URL):
        response = paths[path]["post"]["responses"]["429"]
        assert response["content"]["application/json"]["example"]["code"] == "too_many_requests"
