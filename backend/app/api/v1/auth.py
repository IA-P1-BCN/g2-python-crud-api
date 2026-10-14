from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, oauth2_scheme
from app.api.responses import errors
from app.models.user import User
from app.schemas.auth import LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, Token
from app.schemas.user import UserRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    responses=errors(409, 422),
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar socio",
    description="Crea una cuenta de socio y devuelve el token JWT de acceso.",
)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> Token:
    user = auth_service.register(db, data)
    return auth_service.issue_token(user)


@router.post(
    "/login",
    responses=errors(401, 403, 422),
    response_model=Token,
    summary="Iniciar sesión",
    description="Autentica con email y contraseña y devuelve un token JWT de acceso.",
)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = auth_service.authenticate(db, data.email, data.password)
    return auth_service.issue_token(user)


@router.post(
    "/token",
    responses=errors(401, 403, 422),
    response_model=Token,
    summary="Obtener token (OAuth2)",
    description=(
        "Login estándar de OAuth2 Password Flow: recibe un formulario con `username` (el email) "
        "y `password`, y devuelve el token JWT. Es el endpoint que usa el botón **Authorize** de "
        "esta documentación. Aplica las mismas reglas que `/auth/login`."
    ),
)
def issue_oauth2_token(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
) -> Token:
    user = auth_service.authenticate(db, form.username, form.password)
    return auth_service.issue_token(user)


@router.post(
    "/refresh",
    responses=errors(401, 422),
    response_model=Token,
    summary="Renovar el token de acceso",
    description=(
        "Cambia un token de refresco válido por un token de acceso nuevo, sin volver a pedir la "
        "contraseña. Devuelve el mismo token de refresco. Un token de refresco revocado o "
        "caducado responde 401."
    ),
)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)) -> Token:
    return auth_service.refresh(db, data.refresh_token)


@router.post(
    "/logout",
    responses=errors(401, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    # Rejects a missing, expired or revoked token before the body is read.
    dependencies=[Depends(get_current_user)],
    summary="Cerrar sesión",
    description=(
        "Revoca el token de acceso con el que se llama, que deja de valer aunque no haya "
        "caducado. Si se envía `refresh_token`, también se revoca y ya no sirve para renovar."
    ),
)
def logout(
    data: LogoutRequest | None = None,
    access_token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> None:
    auth_service.logout(db, access_token, data.refresh_token if data else None)


@router.get(
    "/me",
    responses=errors(401),
    response_model=UserRead,
    summary="Usuario autenticado",
    description="Devuelve el usuario actual a partir del token Bearer.",
)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user
