from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, limit_login_attempts, oauth2_scheme
from app.api.responses import errors
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    Token,
    TotpCode,
    TotpSetup,
    VerifyEmailRequest,
)
from app.schemas.user import UserRead
from app.services import auth_service, two_factor_service

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
    responses=errors(401, 403, 422, 429),
    dependencies=[Depends(limit_login_attempts)],
    response_model=Token,
    summary="Iniciar sesión",
    description="Autentica con email y contraseña y devuelve un token JWT de acceso.",
)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = auth_service.authenticate(db, data.email, data.password)
    two_factor_service.check_login(user, data.totp_code)
    return auth_service.issue_token(user)


@router.post(
    "/token",
    responses=errors(401, 403, 422, 429),
    dependencies=[Depends(limit_login_attempts)],
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
    # The OAuth2 form has no field for the code: accounts with 2FA log in with /auth/login.
    two_factor_service.check_login(user, None, form_login=True)
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


@router.post(
    "/verify-email",
    responses=errors(400, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Verificar email",
    description=(
        "Confirma el email con el token del enlace que se envía al registrarse. Repetirlo no es "
        "un error. Por ahora los correos no se envían: el enlace aparece en el log del backend."
    ),
)
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)) -> None:
    auth_service.verify_email(db, data.token)


@router.post(
    "/forgot-password",
    responses=errors(422),
    status_code=status.HTTP_202_ACCEPTED,
    summary="He olvidado mi contraseña",
    description=(
        "Si el email es de una cuenta activa, envía un enlace para crear una contraseña nueva. "
        "Responde 202 siempre, exista o no la cuenta, para no revelar qué emails están "
        "registrados. Por ahora el enlace aparece en el log del backend."
    ),
)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)) -> None:
    auth_service.request_password_reset(db, data.email)


@router.post(
    "/reset-password",
    responses=errors(400, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Restablecer contraseña",
    description=(
        "Cambia la contraseña con el token del enlace de recuperación. El enlace caduca y solo "
        "vale una vez. La contraseña nueva debe cumplir la regla de contraseña fuerte."
    ),
)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)) -> None:
    auth_service.reset_password(db, data.token, data.new_password)


@router.post(
    "/2fa/setup",
    responses=errors(401, 409),
    response_model=TotpSetup,
    summary="Preparar la verificación en dos pasos",
    description=(
        "Genera un secreto nuevo y su enlace `otpauth://` para la app de códigos (Google "
        "Authenticator, Authy...). Todavía no queda activa: hay que confirmarla con "
        "`/auth/2fa/enable`. Si ya está activa responde 409 y no devuelve ningún secreto."
    ),
)
def setup_two_factor(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> TotpSetup:
    return two_factor_service.setup(db, current_user)


@router.post(
    "/2fa/enable",
    responses=errors(400, 401, 409, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Activar la verificación en dos pasos",
    description=(
        "Activa la verificación en dos pasos con un código de la app. Desde ese momento el "
        "login pide el código en `totp_code`."
    ),
)
def enable_two_factor(
    data: TotpCode, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    two_factor_service.enable(db, current_user, data.code)


@router.post(
    "/2fa/disable",
    responses=errors(400, 401, 422),
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desactivar la verificación en dos pasos",
    description=(
        "Desactiva la verificación en dos pasos con un código de la app y borra el secreto."
    ),
)
def disable_two_factor(
    data: TotpCode, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    two_factor_service.disable(db, current_user, data.code)


@router.get(
    "/me",
    responses=errors(401),
    response_model=UserRead,
    summary="Usuario autenticado",
    description="Devuelve el usuario actual a partir del token Bearer.",
)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user
