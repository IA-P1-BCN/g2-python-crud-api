from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GymClassBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    capacity: int = Field(gt=0)
    trainer_id: int
    room_id: int | None = None
    is_active: bool = True


class GymClassCreate(GymClassBase):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Yoga",
                    "capacity": 15,
                    "trainer_id": 2,
                    "room_id": 1,
                    "is_active": True,
                }
            ]
        }
    )


class GymClassUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    capacity: int | None = Field(default=None, gt=0)
    trainer_id: int | None = None
    room_id: int | None = None
    is_active: bool | None = None


class GymClassRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "Yoga",
                    "capacity": 15,
                    "trainer_id": 2,
                    "room_id": 1,
                    "is_active": True,
                    "created_at": "2026-01-01T10:00:00Z",
                }
            ]
        },
    )

    id: int
    name: str
    capacity: int
    trainer_id: int
    room_id: int | None
    is_active: bool
    created_at: datetime
