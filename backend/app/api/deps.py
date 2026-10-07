from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import Page
from app.services import auth_service

__all__ = ["Pagination", "build_page", "get_current_user", "get_db"]

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
