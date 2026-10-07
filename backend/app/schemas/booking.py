from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    member_id: int
    schedule_id: int
    booking_date: date

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"member_id": 1, "schedule_id": 1, "booking_date": "2026-01-05"}]
        }
    )


class BookingRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "member_id": 1,
                    "schedule_id": 1,
                    "booking_date": "2026-01-05",
                    "status": "confirmed",
                    "created_at": "2026-01-01T10:00:00Z",
                }
            ]
        },
    )

    id: int
    member_id: int
    schedule_id: int
    booking_date: date
    status: BookingStatus
    created_at: datetime
