import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registra los modelos en Base.metadata)
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, register_request_logging
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging(settings.log_level, settings.log_file)
    logger.info("GymFlow API iniciada (log_level=%s)", settings.log_level)
    if settings.auto_create_tables:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception:  # noqa: BLE001
            logger.warning(
                "No se pudieron crear las tablas automáticamente. "
                "¿Está PostgreSQL levantado?",
                exc_info=True,
            )
    yield
    logger.info("GymFlow API detenida")


def create_app() -> FastAPI:
    application = FastAPI(
        title="GymFlow API",
        version="0.1.0",
        description=(
            "API REST para la gestión de un gimnasio: socios, planes de membresía, "
            "clases, horarios, reservas y pagos."
        ),
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_request_logging(application)
    register_exception_handlers(application)
    application.include_router(api_router, prefix="/api/v1")

    @application.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
