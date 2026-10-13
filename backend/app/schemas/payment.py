from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    user_id: int
    membership_id: int
    amount_cents: int = Field(gt=0)
    status: PaymentStatus = PaymentStatus.pending

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "user_id": 1,
                    "membership_id": 1,
                    "amount_cents": 3999,
                    "status": "paid",
                }
            ]
        }
    )


class PaymentUpdate(BaseModel):
    amount_cents: int | None = Field(default=None, gt=0)
    status: PaymentStatus | None = None

    # None only means "not sent": an explicit null would empty a required column.
    @field_validator("amount_cents", "status")
    @classmethod
    def field_cannot_be_null(cls, value: int | PaymentStatus | None) -> int | PaymentStatus:
        if value is None:
            raise ValueError("el campo no puede ser nulo")
        return value


class PaymentRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "user_id": 1,
                    "membership_id": 1,
                    "amount_cents": 3999,
                    "status": "paid",
                    "created_at": "2026-01-01T10:00:00Z",
                }
            ]
        },
    )

    id: int
    user_id: int
    membership_id: int
    amount_cents: int
    status: PaymentStatus
    created_at: datetime
