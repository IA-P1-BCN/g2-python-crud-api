from pydantic import BaseModel, ConfigDict


class Page[T](BaseModel):
    """Respuesta paginada genérica."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int


class ErrorResponse(BaseModel):
    """Formato de error común: `detail` con el mensaje y `code` de dominio."""

    detail: str
    code: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"detail": "Recurso no encontrado", "code": "not_found"}]
        }
    )
