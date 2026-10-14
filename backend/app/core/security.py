import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.exceptions import AuthenticationError

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Devuelve el hash de una contraseña en texto plano."""
    return _password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Comprueba si la contraseña coincide con su hash."""
    return _password_hash.verify(password, hashed_password)


# The `type` claim keeps each kind of token in its place: a refresh token never opens an endpoint.
ACCESS_TOKEN = "access"
REFRESH_TOKEN = "refresh"


def _create_token(
    user_id: int, token_type: str, lifetime: timedelta, extra: dict[str, Any] | None = None
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        # Unique id, so a single token can be revoked without touching the user's other sessions.
        "jti": uuid.uuid4().hex,
        "iat": now,
        "exp": now + lifetime,
        **(extra or {}),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(user_id: int, role: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed access token; it expires after the configured lifetime."""
    lifetime = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    return _create_token(user_id, ACCESS_TOKEN, lifetime, {"role": role})


def create_refresh_token(user_id: int, expires_delta: timedelta | None = None) -> str:
    """Create a signed refresh token, which only serves to get new access tokens."""
    lifetime = expires_delta or timedelta(days=settings.refresh_token_expire_days)
    return _create_token(user_id, REFRESH_TOKEN, lifetime)


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    """Return the claims of a token of the given type, or raise AuthenticationError."""
    try:
        claims = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"require": ["sub", "exp", "jti", "type"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("El token ha caducado") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("Token inválido") from exc
    if claims["type"] != expected_type:
        raise AuthenticationError("Token inválido")
    return claims


def decode_access_token(token: str) -> dict[str, Any]:
    return decode_token(token, ACCESS_TOKEN)


def decode_refresh_token(token: str) -> dict[str, Any]:
    return decode_token(token, REFRESH_TOKEN)
