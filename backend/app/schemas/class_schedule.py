from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ClassScheduleBase(BaseModel):
    class_id: int
    day_of_week: int = Field(ge=0, le=6, description="0 = lunes, 6 = domingo")
    start_time: time
    end_time: time
    room_id: int | None = None

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


class ClassScheduleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    class_id: int
    day_of_week: int
    start_time: time
    end_time: time
    room_id: int | None
    created_at: datetime
