from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_can_be_verified() -> None:
    hashed = hash_password("password123")

    assert hashed != "password123"
    assert verify_password("password123", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_token_carries_user_id_and_role() -> None:
    claims = decode_access_token(create_access_token(42, "trainer"))

    assert claims["sub"] == "42"
    assert claims["role"] == "trainer"


def test_token_expires_after_the_configured_lifetime() -> None:
    before = datetime.now(UTC)

    claims = decode_access_token(create_access_token(1, "member"))

    expires_at = datetime.fromtimestamp(claims["exp"], UTC)
    lifetime = timedelta(minutes=settings.access_token_expire_minutes)
    assert abs(expires_at - (before + lifetime)) < timedelta(seconds=5)


def test_expired_token_is_rejected() -> None:
    token = create_access_token(1, "member", expires_delta=timedelta(seconds=-1))

    with pytest.raises(AuthenticationError):
        decode_access_token(token)


def test_tampered_token_is_rejected() -> None:
    header, payload, signature = create_access_token(1, "member").split(".")
    forged_payload = jwt.utils.base64url_encode(b'{"sub":"1","role":"admin","exp":9999999999}')

    with pytest.raises(AuthenticationError):
        decode_access_token(f"{header}.{forged_payload.decode()}.{signature}")


def test_token_signed_with_another_key_is_rejected() -> None:
    payload = {"sub": "1", "role": "admin", "exp": datetime.now(UTC) + timedelta(minutes=5)}
    token = jwt.encode(payload, "another-secret-key-of-at-least-32-bytes", algorithm="HS256")

    with pytest.raises(AuthenticationError):
        decode_access_token(token)


def test_token_without_expiration_is_rejected() -> None:
    token = jwt.encode({"sub": "1"}, settings.secret_key, algorithm=settings.algorithm)

    with pytest.raises(AuthenticationError):
        decode_access_token(token)


@pytest.mark.parametrize("token", ["", "not-a-token", "a.b.c"])
def test_malformed_token_is_rejected(token: str) -> None:
    with pytest.raises(AuthenticationError):
        decode_access_token(token)
