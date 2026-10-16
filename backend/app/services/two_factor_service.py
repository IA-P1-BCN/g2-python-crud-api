"""Two-factor authentication with TOTP codes (6 digits every 30 seconds, RFC 6238)."""

from datetime import UTC, datetime

import pyotp
from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    TotpInvalidError,
    TotpRequiredError,
)
from app.models.user import User
from app.schemas.auth import TotpSetup
from app.services import user_service

ISSUER = "Athletica"
# Accept the code of the current 30-second step and of the one before or after it.
VALID_WINDOW = 1


def setup(db: Session, user: User) -> TotpSetup:
    """Prepare a new secret for the user's app; two-factor stays off until `enable`."""
    if user.totp_enabled_at is not None:
        raise ConflictError("La verificación en dos pasos ya está activada")
    secret = pyotp.random_base32()
    user_service.save_two_factor(db, user, secret=secret, enabled_at=None)
    url = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=ISSUER)
    return TotpSetup(secret=secret, otpauth_url=url)


def enable(db: Session, user: User, code: str, now: datetime | None = None) -> None:
    if user.totp_enabled_at is not None:
        raise ConflictError("La verificación en dos pasos ya está activada")
    if user.totp_secret is None:
        raise BusinessRuleError("Primero prepara la verificación en dos pasos")
    if not _is_valid(user.totp_secret, code, now):
        raise BusinessRuleError("El código no es correcto")
    user_service.save_two_factor(
        db, user, secret=user.totp_secret, enabled_at=now or datetime.now(UTC)
    )


def disable(db: Session, user: User, code: str, now: datetime | None = None) -> None:
    if user.totp_enabled_at is None or user.totp_secret is None:
        raise BusinessRuleError("La verificación en dos pasos no está activada")
    if not _is_valid(user.totp_secret, code, now):
        raise BusinessRuleError("El código no es correcto")
    user_service.save_two_factor(db, user, secret=None, enabled_at=None)


def check_login(
    user: User, code: str | None, *, form_login: bool = False, now: datetime | None = None
) -> None:
    """Second step of a login whose password was already right."""
    if user.totp_enabled_at is None or user.totp_secret is None:
        return
    if form_login:
        raise TotpRequiredError(
            "Esta cuenta tiene verificación en dos pasos: inicia sesión con /auth/login "
            "enviando el código en totp_code"
        )
    if code is None:
        raise TotpRequiredError("Falta el código de verificación en dos pasos")
    if not _is_valid(user.totp_secret, code, now):
        raise TotpInvalidError("El código de verificación en dos pasos no es correcto")


def _is_valid(secret: str, code: str, now: datetime | None) -> bool:
    return pyotp.TOTP(secret).verify(code, for_time=now, valid_window=VALID_WINDOW)
