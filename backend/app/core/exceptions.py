import logging

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Error de dominio base. Todos los errores de negocio heredan de aquí."""

    status_code = 400
    code = "app_error"

    def __init__(self, detail: str, headers: dict[str, str] | None = None) -> None:
        super().__init__(detail)
        self.detail = detail
        self.headers = headers


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class BusinessRuleError(AppError):
    status_code = 400
    code = "business_rule"


class InvalidDataError(AppError):
    """Validation that needs stored data, so it cannot live in the request schema."""

    status_code = 422
    code = "validation_error"


class AuthenticationError(AppError):
    status_code = 401
    code = "unauthorized"


class TotpRequiredError(AuthenticationError):
    """Right password, but the account has two-factor authentication and no code was sent."""

    code = "totp_required"


class TotpInvalidError(AuthenticationError):
    code = "totp_invalid"


class PermissionDeniedError(AppError):
    status_code = 403
    code = "forbidden"


class TooManyRequestsError(AppError):
    status_code = 429
    code = "too_many_requests"

    def __init__(self, detail: str, retry_after: int) -> None:
        super().__init__(detail, headers={"Retry-After": str(retry_after)})


# Errors raised by the framework itself (unknown route, wrong method...), in the API's format
HTTP_ERRORS = {
    401: ("unauthorized", "No autenticado"),
    403: ("forbidden", "Acceso denegado"),
    404: ("not_found", "Recurso no encontrado"),
    405: ("method_not_allowed", "Método no permitido"),
}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            "%s %s -> %s %s: %s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.code,
            exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": exc.code},
            headers=exc.headers,
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code, detail = HTTP_ERRORS.get(exc.status_code, ("http_error", str(exc.detail)))
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": detail, "code": code},
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"detail": jsonable_encoder(exc.errors()), "code": "validation_error"},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Error no controlado en %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "code": "internal_error"},
        )
