import logging
from collections.abc import Callable

from fastapi import Depends, Query, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError, PermissionDeniedError, TooManyRequestsError
from app.core.rate_limit import SlidingWindowLimiter
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.common import Page
from app.services import auth_service

logger = logging.getLogger(__name__)

__all__ = [
    "Pagination",
    "build_page",
    "get_current_user",
    "get_db",
    "limit_login_attempts",
    "require_admin",
    "require_member_or_admin",
    "require_roles",
    "require_staff",
]

# OAuth2 Password Flow: Swagger's Authorize button asks for email and password and gets the
# token from this URL. auto_error=False so a missing token goes through our own error format.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token",
    auto_error=False,
    description="Email (en el campo username) y contraseña de la cuenta",
)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the user identified by the Bearer token, or raise 401."""
    if token is None:
        raise AuthenticationError("Falta el token de acceso")
    return auth_service.get_user_from_token(db, token)


# Shared by every login endpoint, so switching endpoint does not reset the count.
login_limiter = SlidingWindowLimiter(
    settings.login_rate_limit_attempts, settings.login_rate_limit_window_seconds
)


def limit_login_attempts(request: Request) -> None:
    """Allow a limited number of login attempts per client IP; raise 429 beyond it."""
    client_ip = request.client.host if request.client else "unknown"
    retry_after = login_limiter.hit(client_ip)
    if retry_after is not None:
        logger.warning("Login rate limit reached for %s", client_ip)
        raise TooManyRequestsError(
            "Demasiados intentos de inicio de sesión. Vuelve a intentarlo en "
            f"{retry_after} segundos",
            retry_after=retry_after,
        )


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
