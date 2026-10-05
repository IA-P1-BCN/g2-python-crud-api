from fastapi import Query

from app.db.session import get_db
from app.schemas.common import Page

__all__ = ["Pagination", "build_page", "get_db"]


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
