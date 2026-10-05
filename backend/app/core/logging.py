import logging
import sys
import time
from collections.abc import Awaitable, Callable
from logging.handlers import RotatingFileHandler
from pathlib import Path

from fastapi import FastAPI, Request, Response

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_FILE_MAX_BYTES = 1_000_000
LOG_FILE_BACKUP_COUNT = 5

request_logger = logging.getLogger("app.requests")

# Handlers que instala la app; se guardan para poder sustituirlos sin tocar los de terceros
# (por ejemplo, el de pytest).
_app_handlers: list[logging.Handler] = []


def configure_logging(level: str = "INFO", log_file: str = "") -> None:
    """Configura el logging de la aplicación: consola y, si se indica, fichero rotativo."""
    root = logging.getLogger()
    for handler in _app_handlers:
        root.removeHandler(handler)
        handler.close()
    _app_handlers.clear()

    _app_handlers.append(logging.StreamHandler(sys.stdout))
    if log_file:
        path = Path(log_file)
        path.parent.mkdir(parents=True, exist_ok=True)
        _app_handlers.append(
            RotatingFileHandler(
                path,
                maxBytes=LOG_FILE_MAX_BYTES,
                backupCount=LOG_FILE_BACKUP_COUNT,
                encoding="utf-8",
            )
        )

    formatter = logging.Formatter(LOG_FORMAT)
    for handler in _app_handlers:
        handler.setFormatter(formatter)
        root.addHandler(handler)
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # El middleware de peticiones sustituye al access log de uvicorn.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def register_request_logging(app: FastAPI) -> None:
    """Registra cada petición con método, ruta, código de estado y duración."""

    @app.middleware("http")
    async def log_request(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            _log_request(request, 500, start)
            raise
        _log_request(request, response.status_code, start)
        return response


def _log_request(request: Request, status_code: int, start: float) -> None:
    elapsed_ms = (time.perf_counter() - start) * 1000
    if status_code >= 500:
        level = logging.ERROR
    elif status_code >= 400:
        level = logging.WARNING
    else:
        level = logging.INFO
    request_logger.log(
        level, "%s %s %s %.1fms", request.method, request.url.path, status_code, elapsed_ms
    )
