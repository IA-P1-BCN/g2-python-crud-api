from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.password import StrongPassword
from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"email": "socio@example.com", "password": "Athletica123!"}]
        }
    )


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: StrongPassword

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "email": "nuevo@example.com",
                    "full_name": "Nuevo Socio",
                    "password": "Athletica123!",
                }
            ]
        }
    )


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                    "user": {
                        "id": 1,
                        "email": "socio@example.com",
                        "full_name": "Socio Uno",
                        "role": "member",
                        "is_active": True,
                        "created_at": "2026-01-01T10:00:00Z",
                        "deactivated_at": None,
                    },
                }
            ]
        }
    )


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}]
        }
    )


class LogoutRequest(BaseModel):
    """The refresh token is optional: send it so it is revoked too."""

    refresh_token: str | None = Field(default=None, min_length=1)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}]
        }
    )


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=1)

    model_config = ConfigDict(
        json_schema_extra={"examples": [{"token": "eyJhbGciOiJIUzI1NiIs..."}]}
    )


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(json_schema_extra={"examples": [{"email": "socio@example.com"}]})


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: StrongPassword

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"token": "eyJhbGciOiJIUzI1NiIs...", "new_password": "Nueva123!"}]
        }
    )
