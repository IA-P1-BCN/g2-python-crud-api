from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.membership import MembershipStatus


class MembershipCreate(BaseModel):
    user_id: int
    plan_id: int
    start_date: date


class MembershipUpdate(BaseModel):
    start_date: date | None = None
    status: MembershipStatus | None = None


class MembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan_id: int
    start_date: date
    end_date: date
    status: MembershipStatus
    created_at: datetime
