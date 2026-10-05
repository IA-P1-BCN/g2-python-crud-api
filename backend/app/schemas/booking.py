from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    member_id: int
    schedule_id: int
    booking_date: date


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int
    schedule_id: int
    booking_date: date
    status: BookingStatus
    created_at: datetime
