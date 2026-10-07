from pydantic import BaseModel, ConfigDict, Field


class RoomBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    capacity: int = Field(gt=0)


class RoomCreate(RoomBase):
    model_config = ConfigDict(
        json_schema_extra={"examples": [{"name": "Sala 1", "capacity": 20}]}
    )


class RoomUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    capacity: int | None = Field(default=None, gt=0)


class RoomRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"examples": [{"id": 1, "name": "Sala 1", "capacity": 20}]},
    )

    id: int
    name: str
    capacity: int
