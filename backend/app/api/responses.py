"""Error responses for the OpenAPI docs, defined once.

Routes only say which status codes apply to them: `responses=errors(401, 403, 404)`.
The exact message of each case is in docs/errores.md.
"""

from typing import Any

from app.schemas.common import ErrorResponse, ValidationErrorResponse

# status code -> (description, model, example)
_ERRORS: dict[int, tuple[str, type, dict[str, Any]]] = {
    400: (
        "Los datos son correctos, pero una regla de negocio lo impide.",
        ErrorResponse,
        {"detail": "El socio no tiene una membresía activa en esa fecha", "code": "business_rule"},
    ),
    401: (
        "Falta el token, ha caducado o no es válido; o las credenciales son incorrectas.",
        ErrorResponse,
        {"detail": "Falta el token de acceso", "code": "unauthorized"},
    ),
    403: (
        "Hay sesión, pero ese rol o ese usuario no tiene permiso.",
        ErrorResponse,
        {"detail": "No tienes permiso para realizar esta acción", "code": "forbidden"},
    ),
    404: (
        "El recurso indicado no existe.",
        ErrorResponse,
        {"detail": "Usuario 999 no encontrado", "code": "not_found"},
    ),
    409: (
        "La petición choca con datos que ya existen.",
        ErrorResponse,
        {"detail": "El email ya está registrado", "code": "conflict"},
    ),
    422: (
        "Datos mal formados o incoherentes. `detail` es un texto o la lista de campos que fallan.",
        ValidationErrorResponse,
        {
            "detail": [
                {
                    "type": "missing",
                    "loc": ["body", "email"],
                    "msg": "Field required",
                    "input": {},
                }
            ],
            "code": "validation_error",
        },
    ),
}


def errors(*status_codes: int) -> dict[int | str, dict[str, Any]]:
    """Build the `responses` argument of a route from the status codes it can return."""
    responses: dict[int | str, dict[str, Any]] = {}
    for status_code in status_codes:
        description, model, example = _ERRORS[status_code]
        responses[status_code] = {
            "description": description,
            "model": model,
            "content": {"application/json": {"example": example}},
        }
    return responses
