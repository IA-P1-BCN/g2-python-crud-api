from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError, BusinessRuleError, PermissionDeniedError
from app.core.security import (
    EMAIL_VERIFICATION_TOKEN,
    PASSWORD_RESET_TOKEN,
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    decode_token,
    verify_password,
)
from app.models.user import User
from app.repositories import token_repository, user_repository
from app.schemas.auth import RegisterRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services import email_service, user_service

INVALID_LINK = "El enlace no es válido o ha caducado"


def register(db: Session, data: RegisterRequest) -> User:
    """Create a member account and send the email verification link."""
    user = user_service.create_user(db, UserCreate(**data.model_dump()), created_by=None)
    link = f"{settings.frontend_url}/verify-email?token={create_email_verification_token(user.id)}"
    email_service.send_email(
        user.email, "Confirma tu email", f"Confirma tu email en este enlace: {link}"
    )
    return user


def verify_email(db: Session, token: str) -> None:
    claims = _decode_link(token, EMAIL_VERIFICATION_TOKEN)
    user_service.mark_email_verified(db, _link_user(db, claims))


def request_password_reset(db: Session, email: str) -> None:
    """Send a recovery link if the account exists and is active; say nothing either way."""
    user = user_service.get_user_by_email(db, email)
    if user is None or not user.is_active:
        return
    link = f"{settings.frontend_url}/reset-password?token={create_password_reset_token(user.id)}"
    email_service.send_email(
        user.email,
        "Recupera tu contraseña",
        f"Crea una contraseña nueva en este enlace (caduca en "
        f"{settings.password_reset_expire_minutes} minutos): {link}",
    )


def reset_password(db: Session, token: str, new_password: str) -> None:
    """Set a new password with a recovery link, which is spent on use."""
    claims = _decode_link(token, PASSWORD_RESET_TOKEN)
    if token_repository.is_revoked(db, claims["jti"]):
        raise BusinessRuleError(INVALID_LINK)
    user = _link_user(db, claims)
    user_service.reset_password(db, user, new_password)
    token_repository.revoke(
        db,
        jti=claims["jti"],
        user_id=user.id,
        expires_at=datetime.fromtimestamp(claims["exp"], UTC),
    )


def _decode_link(token: str, token_type: str) -> dict[str, Any]:
    """Claims of an emailed link. A bad link is a 400, not a 401: it is not a session."""
    try:
        return decode_token(token, token_type)
    except AuthenticationError as exc:
        raise BusinessRuleError(INVALID_LINK) from exc


def _link_user(db: Session, claims: dict[str, Any]) -> User:
    user = user_repository.get(db, int(claims["sub"])) if claims["sub"].isdigit() else None
    if user is None or not user.is_active:
        raise BusinessRuleError(INVALID_LINK)
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    """Return the active user with those credentials; the JSON and OAuth2 logins both use it."""
    user = user_service.get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthenticationError("Email o contraseña incorrectos")
    if not user.is_active:
        raise PermissionDeniedError("La cuenta está desactivada")
    return user


def get_user_from_token(db: Session, token: str) -> User:
    """Return the active user an access token belongs to, or raise AuthenticationError."""
    return _active_user(db, decode_access_token(token))


def issue_token(user: User) -> Token:
    """Open a session: a short-lived access token and a long-lived refresh token."""
    return Token(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
        user=UserRead.model_validate(user),
    )


def refresh(db: Session, refresh_token: str) -> Token:
    """Exchange a valid refresh token for a new access token; the refresh token is kept."""
    user = _active_user(db, decode_refresh_token(refresh_token))
    return Token(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=refresh_token,
        user=UserRead.model_validate(user),
    )


def logout(db: Session, access_token: str, refresh_token: str | None = None) -> None:
    """Revoke the access token of the session and, when given, its refresh token."""
    access_claims = decode_access_token(access_token)
    _active_user(db, access_claims)
    claims_to_revoke = [access_claims]
    if refresh_token is not None:
        refresh_claims = decode_refresh_token(refresh_token)
        if refresh_claims["sub"] != access_claims["sub"]:
            raise AuthenticationError("Token inválido")
        claims_to_revoke.append(refresh_claims)
    for claims in claims_to_revoke:
        token_repository.revoke(
            db,
            jti=claims["jti"],
            user_id=int(claims["sub"]),
            expires_at=datetime.fromtimestamp(claims["exp"], UTC),
        )


def _active_user(db: Session, claims: dict[str, Any]) -> User:
    """The user of a decoded token, if the token is not revoked and the account is active."""
    if token_repository.is_revoked(db, claims["jti"]):
        raise AuthenticationError("El token ha sido revocado")
    user = user_repository.get(db, int(claims["sub"])) if claims["sub"].isdigit() else None
    if user is None:
        raise AuthenticationError("Token inválido")
    if not user.is_active:
        raise AuthenticationError("La cuenta está desactivada")
    return user
