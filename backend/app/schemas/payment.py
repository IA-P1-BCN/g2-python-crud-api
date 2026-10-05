from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    user_id: int
    membership_id: int
    amount_cents: int = Field(gt=0)
    status: PaymentStatus = PaymentStatus.pending


class PaymentUpdate(BaseModel):
    amount_cents: int | None = Field(default=None, gt=0)
    status: PaymentStatus | None = None


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    membership_id: int
    amount_cents: int
    status: PaymentStatus
    created_at: datetime
