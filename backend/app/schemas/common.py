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
        json_schema_extra={"examples": [{"detail": "Recurso no encontrado", "code": "not_found"}]}
    )


class ValidationError(BaseModel):
    """One field that failed validation. Same name and shape FastAPI gives it, so API clients
    generated from the schema keep their `ValidationError` type."""

    model_config = ConfigDict(extra="allow")

    loc: list[str | int]
    msg: str
    type: str


class ValidationErrorResponse(BaseModel):
    """A 422: `detail` is a message, or the list of fields that failed validation."""

    detail: str | list[ValidationError]
    code: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "detail": [
                        {"type": "missing", "loc": ["body", "email"], "msg": "Field required"}
                    ],
                    "code": "validation_error",
                }
            ]
        }
    )
