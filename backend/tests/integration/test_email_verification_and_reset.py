"""Email verification and password recovery (specs/412-email-verification-and-password-recovery.md).

No email is really sent: `outbox` replaces the sender and keeps what would have gone out.
"""

from datetime import timedelta
from urllib.parse import parse_qs, urlparse

import pytest

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
)
from app.models.user import User
from app.services import email_service

API = "/api/v1"
NEW_PASSWORD = "Nueva123!"
# Password used by the user fixtures in conftest.py
FIXTURE_PASSWORD = "password123"
INVALID_LINK = {"detail": "El enlace no es válido o ha caducado", "code": "business_rule"}


@pytest.fixture()
def outbox(monkeypatch) -> list[dict[str, str]]:
    sent: list[dict[str, str]] = []
    monkeypatch.setattr(
        email_service,
        "send_email",
        lambda to, subject, body: sent.append({"to": to, "subject": subject, "body": body}),
    )
    return sent


def _token_in(email: dict[str, str], path: str) -> str:
    link = next(word for word in email["body"].split() if word.startswith(settings.frontend_url))
    parsed = urlparse(link)
    assert parsed.path == path
    return parse_qs(parsed.query)["token"][0]


def _register(client, email: str = "nueva@test.dev") -> dict:
    response = client.post(
        f"{API}/auth/register",
        json={"email": email, "full_name": "Socia Nueva", "password": "Password123!"},
    )
    assert response.status_code == 201
    return response.json()["user"]


def _login(client, email: str, password: str) -> int:
    return client.post(f"{API}/auth/login", json={"email": email, "password": password}).status_code


# Email verification


def test_register_sends_the_verification_link(anon_client, outbox) -> None:
    _register(anon_client)

    assert len(outbox) == 1
    assert outbox[0]["to"] == "nueva@test.dev"
    assert _token_in(outbox[0], "/verify-email")


def test_the_link_verifies_the_email(anon_client, db_session, outbox) -> None:
    user = _register(anon_client)
    token = _token_in(outbox[0], "/verify-email")

    response = anon_client.post(f"{API}/auth/verify-email", json={"token": token})

    assert response.status_code == 204
    assert db_session.get(User, user["id"]).email_verified_at is not None


def test_verifying_twice_keeps_the_first_date(anon_client, db_session, outbox) -> None:
    user = _register(anon_client)
    token = _token_in(outbox[0], "/verify-email")
    anon_client.post(f"{API}/auth/verify-email", json={"token": token})
    first = db_session.get(User, user["id"]).email_verified_at

    response = anon_client.post(f"{API}/auth/verify-email", json={"token": token})

    assert response.status_code == 204
    db_session.expire_all()
    assert db_session.get(User, user["id"]).email_verified_at == first


def test_new_accounts_start_unverified(anon_client, db_session, outbox) -> None:
    user = _register(anon_client)

    assert db_session.get(User, user["id"]).email_verified_at is None


@pytest.mark.parametrize(
    "token",
    [
        "not-a-token",
        create_access_token(1, "member"),
        create_password_reset_token(1),
    ],
    ids=["garbage", "session token", "reset token"],
)
def test_a_bad_verification_link_returns_400(anon_client, member, token: str) -> None:
    response = anon_client.post(f"{API}/auth/verify-email", json={"token": token})

    assert response.status_code == 400
    assert response.json() == INVALID_LINK


def test_an_expired_verification_link_returns_400(anon_client, member, monkeypatch) -> None:
    monkeypatch.setattr(settings, "email_verification_expire_hours", -1)
    token = create_email_verification_token(member.id)

    response = anon_client.post(f"{API}/auth/verify-email", json={"token": token})

    assert response.status_code == 400


# Password recovery


def test_forgot_password_sends_a_link_to_an_active_account(anon_client, member, outbox) -> None:
    response = anon_client.post(f"{API}/auth/forgot-password", json={"email": member.email})

    assert response.status_code == 202
    assert [email["to"] for email in outbox] == [member.email]
    assert _token_in(outbox[0], "/reset-password")


def test_forgot_password_answers_the_same_for_unknown_and_inactive_accounts(
    anon_client, db_session, member, outbox
) -> None:
    known = anon_client.post(f"{API}/auth/forgot-password", json={"email": member.email})
    outbox.clear()
    member.is_active = False
    db_session.commit()

    inactive = anon_client.post(f"{API}/auth/forgot-password", json={"email": member.email})
    unknown = anon_client.post(f"{API}/auth/forgot-password", json={"email": "nadie@test.dev"})

    assert known.status_code == inactive.status_code == unknown.status_code == 202
    assert known.content == inactive.content == unknown.content
    assert outbox == []


def test_forgot_password_validates_the_email(anon_client) -> None:
    response = anon_client.post(f"{API}/auth/forgot-password", json={"email": "no-es-un-email"})

    assert response.status_code == 422


def test_the_reset_link_changes_the_password(anon_client, member, outbox) -> None:
    anon_client.post(f"{API}/auth/forgot-password", json={"email": member.email})
    token = _token_in(outbox[0], "/reset-password")

    response = anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD}
    )

    assert response.status_code == 204
    assert _login(anon_client, member.email, NEW_PASSWORD) == 200
    assert _login(anon_client, member.email, FIXTURE_PASSWORD) == 401


def test_a_reset_link_works_only_once(anon_client, member, outbox) -> None:
    anon_client.post(f"{API}/auth/forgot-password", json={"email": member.email})
    token = _token_in(outbox[0], "/reset-password")
    anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD}
    )

    response = anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": "Otra456!"}
    )

    assert response.status_code == 400
    assert response.json() == INVALID_LINK
    assert _login(anon_client, member.email, NEW_PASSWORD) == 200


def test_a_reset_with_a_weak_password_changes_nothing(anon_client, member) -> None:
    token = create_password_reset_token(member.id)

    response = anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": "debil"}
    )

    assert response.status_code == 422
    assert _login(anon_client, member.email, FIXTURE_PASSWORD) == 200
    retry = anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD}
    )
    assert retry.status_code == 204


@pytest.mark.parametrize(
    "make_token",
    [
        lambda user_id: create_password_reset_token(user_id, expires_delta=timedelta(seconds=-1)),
        lambda user_id: create_email_verification_token(user_id),
        lambda user_id: create_access_token(user_id, "member"),
        lambda user_id: "not-a-token",
    ],
    ids=["expired", "verification token", "session token", "garbage"],
)
def test_a_bad_reset_link_returns_400(anon_client, member, make_token) -> None:
    response = anon_client.post(
        f"{API}/auth/reset-password",
        json={"token": make_token(member.id), "new_password": NEW_PASSWORD},
    )

    assert response.status_code == 400
    assert response.json() == INVALID_LINK


def test_a_reset_link_of_a_deactivated_account_returns_400(anon_client, db_session, member) -> None:
    token = create_password_reset_token(member.id)
    member.is_active = False
    db_session.commit()

    response = anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_the_reset_is_recorded_in_the_audit(anon_client, member, admin) -> None:
    token = create_password_reset_token(member.id)
    anon_client.post(
        f"{API}/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD}
    )

    audit = anon_client.get(
        f"{API}/users/{member.id}/audit",
        headers={"Authorization": f"Bearer {create_access_token(admin.id, 'admin')}"},
    ).json()

    assert audit["updated_by"]["id"] == member.id


# Link tokens never open a session


@pytest.mark.parametrize(
    "make_token", [create_email_verification_token, create_password_reset_token]
)
def test_link_tokens_do_not_open_the_api(anon_client, member, make_token) -> None:
    token = make_token(member.id)

    response = anon_client.get(f"{API}/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_the_default_sender_writes_the_email_to_the_log(caplog) -> None:
    with caplog.at_level("INFO", logger="app.email"):
        email_service.send_email("a@test.dev", "Asunto", "Cuerpo con enlace")

    assert "Email to a@test.dev | Asunto | Cuerpo con enlace" in caplog.text
