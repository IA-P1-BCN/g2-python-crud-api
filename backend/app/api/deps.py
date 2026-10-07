from collections.abc import Callable

from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.common import Page
from app.services import auth_service

__all__ = [
    "Pagination",
    "build_page",
    "get_current_user",
    "get_db",
    "require_admin",
    "require_member_or_admin",
    "require_roles",
    "require_staff",
]

# auto_error=False so a missing token goes through our own error format (401, not 403).
bearer_scheme = HTTPBearer(auto_error=False, description="Token devuelto por /auth/login")


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the user identified by the Bearer token, or raise 401."""
    if credentials is None:
        raise AuthenticationError("Falta el token de acceso")
    return auth_service.get_user_from_token(db, credentials.credentials)


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    """Build a dependency that lets in only users with one of the given roles (403 otherwise)."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise PermissionDeniedError("No tienes permiso para realizar esta acción")
        return current_user

    return dependency


require_admin = require_roles(UserRole.admin)
require_staff = require_roles(UserRole.admin, UserRole.trainer)
require_member_or_admin = require_roles(UserRole.admin, UserRole.member)


class Pagination:
    """Dependencia reutilizable de paginación."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Número de página (empieza en 1)"),
        size: int = Query(10, ge=1, le=100, description="Elementos por página"),
    ) -> None:
        self.page = page
        self.size = size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


def build_page[T](items: list[T], total: int, pagination: Pagination) -> Page[T]:
    pages = max(1, (total + pagination.size - 1) // pagination.size)
    return Page(
        items=items,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=pages,
    )
