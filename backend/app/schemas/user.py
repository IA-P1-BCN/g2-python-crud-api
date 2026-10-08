from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole
from app.schemas.password import StrongPassword


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.member
    is_active: bool = True


class UserCreate(UserBase):
    password: StrongPassword

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "email": "socio@example.com",
                    "full_name": "Socio Uno",
                    "role": "member",
                    "is_active": True,
                    "password": "Athletica123!",
                }
            ]
        }
    )


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None
    password: StrongPassword | None = None


class ProfileUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=255)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: StrongPassword


class UserFilters(BaseModel):
    """Query filters of the users listing. Date ranges include both ends."""

    role: UserRole | None = None
    is_active: bool | None = None
    search: str | None = Field(
        default=None, min_length=1, max_length=255, description="Texto en el nombre o el email"
    )
    created_from: date | None = Field(default=None, description="Altas desde esta fecha")
    created_to: date | None = Field(default=None, description="Altas hasta esta fecha")
    deactivated_from: date | None = Field(default=None, description="Bajas desde esta fecha")
    deactivated_to: date | None = Field(default=None, description="Bajas hasta esta fecha")


class UserRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "email": "socio@example.com",
                    "full_name": "Socio Uno",
                    "role": "member",
                    "is_active": True,
                    "created_at": "2026-01-01T10:00:00Z",
                    "deactivated_at": None,
                }
            ]
        },
    )

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    deactivated_at: datetime | None
