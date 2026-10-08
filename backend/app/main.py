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
    logger.info("Athletica API started (log_level=%s)", settings.log_level)
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
    logger.info("Athletica API stopped")


def create_app() -> FastAPI:
    application = FastAPI(
        title="Athletica API",
        version="0.1.0",
        summary="API REST para la gestión de un gimnasio",
        description=(
            "API para gestionar socios, entrenadores, planes de membresía, clases, "
            "horarios, reservas y pagos.\n\n"
            "Autenticación mediante **JWT**: haz `POST /api/v1/auth/login` y usa el "
            "`access_token` con el botón **Authorize** (esquema `Bearer`).\n\n"
            "Documentación interactiva en `/docs` y esquema OpenAPI en `/openapi.json`."
        ),
        openapi_tags=[
            {"name": "health", "description": "Estado del servicio."},
            {"name": "auth", "description": "Registro, inicio de sesión y usuario autenticado."},
            {"name": "users", "description": "Usuarios, y sus membresías y reservas."},
            {"name": "membership-plans", "description": "Planes de membresía."},
            {"name": "memberships", "description": "Suscripciones de los socios."},
            {"name": "rooms", "description": "Salas del gimnasio."},
            {"name": "classes", "description": "Clases y sus horarios."},
            {"name": "class-schedules", "description": "Horarios semanales de las clases."},
            {"name": "bookings", "description": "Reservas de los socios en los horarios."},
            {"name": "payments", "description": "Pagos asociados a las membresías."},
            {"name": "export", "description": "Exportación de datos a CSV."},
        ],
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
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

    @application.get(
        "/health",
        tags=["health"],
        summary="Estado del servicio",
        description="Comprobación de salud: devuelve `{\"status\": \"ok\"}`.",
    )
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
