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


def create_access_token(user_id: int, role: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT for the user; it expires after the configured lifetime."""
    now = datetime.now(UTC)
    lifetime = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "role": role, "iat": now, "exp": now + lifetime}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Return the token claims, or raise AuthenticationError if it is expired or invalid."""
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"require": ["sub", "exp"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("El token ha caducado") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("Token inválido") from exc
