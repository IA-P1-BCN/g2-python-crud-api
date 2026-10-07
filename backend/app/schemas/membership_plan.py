from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MembershipPlanBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    price_cents: int = Field(gt=0)
    duration_days: int = Field(gt=0)
    is_active: bool = True


class MembershipPlanCreate(MembershipPlanBase):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Mensual",
                    "description": "Acceso completo durante 30 días",
                    "price_cents": 3999,
                    "duration_days": 30,
                    "is_active": True,
                }
            ]
        }
    )


class MembershipPlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    price_cents: int | None = Field(default=None, gt=0)
    duration_days: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class MembershipPlanRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "Mensual",
                    "description": "Acceso completo durante 30 días",
                    "price_cents": 3999,
                    "duration_days": 30,
                    "is_active": True,
                    "created_at": "2026-01-01T10:00:00Z",
                }
            ]
        },
    )

    id: int
    name: str
    description: str | None
    price_cents: int
    duration_days: int
    is_active: bool
    created_at: datetime
