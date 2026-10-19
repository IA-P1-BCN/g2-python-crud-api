from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.payment import PaymentStatus
from app.schemas.membership import MembershipSummary
from app.schemas.user import UserRead


class MemberLastPayment(BaseModel):
    payment_id: int
    amount_cents: int
    status: PaymentStatus
    created_at: datetime


class AdminMember(UserRead):
    """A member as the admin panel lists them: user data, plan and last payment."""

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "email": "socio@example.com",
                    "full_name": "Socio Uno",
                    "role": "member",
                    "is_active": True,
                    "created_at": "2026-01-01T10:00:00Z",
                    "deactivated_at": None,
                    "membership": {
                        "membership_id": 1,
                        "plan_id": 1,
                        "plan_name": "Mensual",
                        "start_date": "2026-01-01",
                        "end_date": "2026-01-31",
                        "status": "active",
                    },
                    "last_payment": {
                        "payment_id": 1,
                        "amount_cents": 3999,
                        "status": "paid",
                        "created_at": "2026-01-01T10:00:00Z",
                    },
                }
            ]
        },
    )

    membership: MembershipSummary | None
    last_payment: MemberLastPayment | None
