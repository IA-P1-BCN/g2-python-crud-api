from pydantic import BaseModel


class Page[T](BaseModel):
    """Respuesta paginada genérica."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int


class ErrorResponse(BaseModel):
    detail: str
    code: str
