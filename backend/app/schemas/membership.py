from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.membership import MembershipStatus


class MembershipCreate(BaseModel):
    user_id: int
    plan_id: int
    start_date: date

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"user_id": 1, "plan_id": 1, "start_date": "2026-01-01"}]
        }
    )


class MembershipUpdate(BaseModel):
    start_date: date | None = None
    status: MembershipStatus | None = None


class MembershipRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "user_id": 1,
                    "plan_id": 1,
                    "start_date": "2026-01-01",
                    "end_date": "2026-01-31",
                    "status": "active",
                    "created_at": "2026-01-01T10:00:00Z",
                }
            ]
        },
    )

    id: int
    user_id: int
    plan_id: int
    start_date: date
    end_date: date
    status: MembershipStatus
    created_at: datetime


class MembershipSummary(BaseModel):
    """A membership with the name of its plan, as the member and admin screens show it."""

    membership_id: int
    plan_id: int
    plan_name: str
    start_date: date
    end_date: date
    status: MembershipStatus
