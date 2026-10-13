from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import create_access_token, decode_access_token, verify_password
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import RegisterRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services import user_service


def register(db: Session, data: RegisterRequest) -> User:
    """Create a member account; the role cannot be chosen by the caller."""
    return user_service.create_user(db, UserCreate(**data.model_dump()))


def authenticate(db: Session, email: str, password: str) -> User:
    """Return the active user with those credentials; the JSON and OAuth2 logins both use it."""
    user = user_service.get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthenticationError("Email o contraseña incorrectos")
    if not user.is_active:
        raise PermissionDeniedError("La cuenta está desactivada")
    return user


def get_user_from_token(db: Session, token: str) -> User:
    """Return the active user a token belongs to, or raise AuthenticationError."""
    claims = decode_access_token(token)
    user = user_repository.get(db, int(claims["sub"])) if claims["sub"].isdigit() else None
    if user is None:
        raise AuthenticationError("Token inválido")
    if not user.is_active:
        raise AuthenticationError("La cuenta está desactivada")
    return user


def issue_token(user: User) -> Token:
    return Token(
        access_token=create_access_token(user.id, user.role.value),
        user=UserRead.model_validate(user),
    )
