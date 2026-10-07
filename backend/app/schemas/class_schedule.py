from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ClassScheduleBase(BaseModel):
    class_id: int
    day_of_week: int = Field(ge=0, le=6, description="0 = lunes, 6 = domingo")
    start_time: time
    end_time: time
    room_id: int

    @model_validator(mode="after")
    def validate_times(self) -> "ClassScheduleBase":
        if self.start_time >= self.end_time:
            raise ValueError("start_time debe ser anterior a end_time")
        return self


class ClassScheduleCreate(ClassScheduleBase):
    pass


class ClassScheduleUpdate(BaseModel):
    class_id: int | None = None
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    start_time: time | None = None
    end_time: time | None = None
    room_id: int | None = None

    # None only means "not sent": an explicit null would leave the schedule without a room.
    @field_validator("room_id")
    @classmethod
    def room_cannot_be_removed(cls, value: int | None) -> int:
        if value is None:
            raise ValueError("room_id no puede ser nulo")
        return value


class ClassScheduleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    class_id: int
    day_of_week: int
    start_time: time
    end_time: time
    room_id: int | None
    created_at: datetime


class ScheduleAvailability(BaseModel):
    """Spots of one session: a schedule on a given date."""

    schedule_id: int
    on_date: date
    capacity: int
    booked: int
    available: int
