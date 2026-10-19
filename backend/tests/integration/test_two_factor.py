"""Two-factor authentication with TOTP (specs/415-two-factor-authentication.md).

Codes are made with the user's own secret. Tests that need an exact moment pass `now` to the
service; the API tests generate the code for the current moment, which the service accepts with
a 30-second margin either way.
"""

from datetime import UTC, datetime, timedelta

import pyotp
import pytest

from app.core.exceptions import TotpInvalidError
from app.core.security import create_access_token
from app.services import two_factor_service

API = "/api/v1"
# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"
MOMENT = datetime(2026, 10, 15, 12, 0, 0, tzinfo=UTC)


def _auth(user) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}


def _code(secret: str, at: datetime | None = None) -> str:
    return pyotp.TOTP(secret).at(at or datetime.now(UTC))


def _wrong_code(secret: str) -> str:
    """A code that is not valid now nor in the 30-second steps around it."""
    totp = pyotp.TOTP(secret)
    now = datetime.now(UTC)
    taken = {totp.at(now + timedelta(seconds=step * 30)) for step in (-2, -1, 0, 1, 2)}
    return next(f"{n:06d}" for n in range(1_000_000) if f"{n:06d}" not in taken)


def _login(client, user, code: str | None = None):
    body = {"email": user.email, "password": FIXTURE_PASSWORD}
    if code is not None:
        body["totp_code"] = code
    return client.post(f"{API}/auth/login", json=body)


@pytest.fixture()
def secret(anon_client, member) -> str:
    """Two-factor turned on for `member`; returns the secret their app would hold."""
    secret = anon_client.post(f"{API}/auth/2fa/setup", headers=_auth(member)).json()["secret"]
    response = anon_client.post(
        f"{API}/auth/2fa/enable", json={"code": _code(secret)}, headers=_auth(member)
    )
    assert response.status_code == 204
    return secret


# Turning it on


def test_setup_returns_the_secret_and_the_app_link(anon_client, member) -> None:
    response = anon_client.post(f"{API}/auth/2fa/setup", headers=_auth(member))

    assert response.status_code == 200
    body = response.json()
    assert len(body["secret"]) >= 16
    assert body["otpauth_url"].startswith("otpauth://totp/Athletica:")
    assert f"secret={body['secret']}" in body["otpauth_url"]


def test_setup_alone_does_not_turn_it_on(anon_client, member) -> None:
    anon_client.post(f"{API}/auth/2fa/setup", headers=_auth(member))

    assert _login(anon_client, member).status_code == 200


def test_enable_with_a_wrong_code_returns_400(anon_client, member) -> None:
    secret = anon_client.post(f"{API}/auth/2fa/setup", headers=_auth(member)).json()["secret"]

    response = anon_client.post(
        f"{API}/auth/2fa/enable", json={"code": _wrong_code(secret)}, headers=_auth(member)
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "El código no es correcto", "code": "business_rule"}
    assert _login(anon_client, member).status_code == 200


def test_enable_without_setup_returns_400(anon_client, member) -> None:
    response = anon_client.post(
        f"{API}/auth/2fa/enable", json={"code": "123456"}, headers=_auth(member)
    )

    assert response.status_code == 400


def test_setup_once_enabled_returns_409_without_a_secret(anon_client, member, secret) -> None:
    response = anon_client.post(f"{API}/auth/2fa/setup", headers=_auth(member))

    assert response.status_code == 409
    assert "secret" not in response.json()


@pytest.mark.parametrize("code", ["12345", "1234567", "abcdef", ""])
def test_codes_must_be_six_digits(anon_client, member, code: str) -> None:
    response = anon_client.post(
        f"{API}/auth/2fa/enable", json={"code": code}, headers=_auth(member)
    )

    assert response.status_code == 422


# Logging in


def test_login_without_two_factor_ignores_the_code(anon_client, member) -> None:
    assert _login(anon_client, member, "123456").status_code == 200


def test_login_with_two_factor_needs_the_code(anon_client, member, secret) -> None:
    response = _login(anon_client, member)

    assert response.status_code == 401
    assert response.json()["code"] == "totp_required"


def test_login_with_a_wrong_code_returns_401(anon_client, member, secret) -> None:
    response = _login(anon_client, member, _wrong_code(secret))

    assert response.status_code == 401
    assert response.json()["code"] == "totp_invalid"


def test_login_with_the_right_code_opens_the_session(anon_client, member, secret) -> None:
    response = _login(anon_client, member, _code(secret))

    assert response.status_code == 200
    assert response.json()["user"]["id"] == member.id


def test_a_wrong_password_answers_as_always(anon_client, member, secret) -> None:
    response = anon_client.post(
        f"{API}/auth/login",
        json={"email": member.email, "password": "wrong", "totp_code": _code(secret)},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Email o contraseña incorrectos", "code": "unauthorized"}


def test_the_swagger_login_refuses_accounts_with_two_factor(anon_client, member, secret) -> None:
    response = anon_client.post(
        f"{API}/auth/token", data={"username": member.email, "password": FIXTURE_PASSWORD}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "totp_required"
    assert "/auth/login" in response.json()["detail"]


# Turning it off


def test_disable_with_the_right_code_turns_it_off(anon_client, member, secret) -> None:
    response = anon_client.post(
        f"{API}/auth/2fa/disable", json={"code": _code(secret)}, headers=_auth(member)
    )

    assert response.status_code == 204
    assert _login(anon_client, member).status_code == 200


def test_disable_with_a_wrong_code_keeps_it_on(anon_client, member, secret) -> None:
    response = anon_client.post(
        f"{API}/auth/2fa/disable", json={"code": _wrong_code(secret)}, headers=_auth(member)
    )

    assert response.status_code == 400
    assert _login(anon_client, member).json()["code"] == "totp_required"


def test_disable_when_it_is_off_returns_400(anon_client, member) -> None:
    response = anon_client.post(
        f"{API}/auth/2fa/disable", json={"code": "123456"}, headers=_auth(member)
    )

    assert response.status_code == 400


@pytest.mark.parametrize("action", ["setup", "enable", "disable"])
def test_two_factor_endpoints_need_a_session(anon_client, action: str) -> None:
    response = anon_client.post(f"{API}/auth/2fa/{action}", json={"code": "123456"})

    assert response.status_code == 401


# The secret never leaks


def test_user_responses_never_include_the_secret(anon_client, member, secret) -> None:
    for path in ("/users/me", "/auth/me", f"/users/{member.id}"):
        body = anon_client.get(f"{API}{path}", headers=_auth(member)).text
        assert secret not in body
        assert "totp" not in body


def test_turning_it_on_is_recorded_in_the_audit(anon_client, member, admin, secret) -> None:
    audit = anon_client.get(f"{API}/users/{member.id}/audit", headers=_auth(admin)).json()

    assert audit["updated_by"]["id"] == member.id


# Exact time margins, checked on the service with a fixed moment


class _User:
    def __init__(self, secret: str) -> None:
        self.totp_secret = secret
        self.totp_enabled_at = MOMENT


@pytest.mark.parametrize("offset", [-30, 0, 30])
def test_the_code_of_the_current_step_and_its_neighbours_is_accepted(offset: int) -> None:
    secret = pyotp.random_base32()
    code = _code(secret, MOMENT + timedelta(seconds=offset))

    two_factor_service.check_login(_User(secret), code, now=MOMENT)


@pytest.mark.parametrize("offset", [-90, 90, 3600])
def test_older_or_newer_codes_are_refused(offset: int) -> None:
    secret = pyotp.random_base32()
    code = _code(secret, MOMENT + timedelta(seconds=offset))

    with pytest.raises(TotpInvalidError):
        two_factor_service.check_login(_User(secret), code, now=MOMENT)
