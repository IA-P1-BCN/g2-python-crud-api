from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MembershipPlanBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    price_cents: int = Field(gt=0)
    duration_days: int = Field(gt=0)
    is_active: bool = True


class MembershipPlanCreate(MembershipPlanBase):
    pass


class MembershipPlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    price_cents: int | None = Field(default=None, gt=0)
    duration_days: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class MembershipPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price_cents: int
    duration_days: int
    is_active: bool
    created_at: datetime
