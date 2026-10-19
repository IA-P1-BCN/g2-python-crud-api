"""Members list of the admin panel: each member with their plan and last payment."""

from datetime import date

from sqlalchemy.orm import Session

from app.models.membership import Membership, MembershipStatus
from app.models.payment import Payment
from app.models.user import UserRole
from app.schemas.admin_member import AdminMember, MemberLastPayment
from app.schemas.membership import MembershipSummary
from app.schemas.user import UserFilters, UserRead
from app.services import membership_service, payment_service, user_service


def list_members(
    db: Session, *, page: int, size: int, filters: UserFilters, today: date | None = None
) -> tuple[list[AdminMember], int]:
    """One page of members; the number of queries does not grow with the page size."""
    today = today or date.today()
    filters = filters.model_copy(update={"role": UserRole.member})
    users, total = user_service.list_users(db, page=page, size=size, filters=filters)

    user_ids = [user.id for user in users]
    memberships = membership_service.get_current_for_users(db, user_ids, today)
    payments = payment_service.get_last_for_users(db, user_ids)

    members = [
        AdminMember(
            **UserRead.model_validate(user).model_dump(),
            membership=_membership_summary(memberships.get(user.id), today),
            last_payment=_last_payment(payments.get(user.id)),
        )
        for user in users
    ]
    return members, total


def _membership_summary(membership: Membership | None, today: date) -> MembershipSummary | None:
    if membership is None:
        return None
    return MembershipSummary(
        membership_id=membership.id,
        plan_id=membership.plan_id,
        plan_name=membership.plan.name,
        start_date=membership.start_date,
        end_date=membership.end_date,
        status=membership_service.compute_status(
            membership.start_date,
            membership.end_date,
            today=today,
            cancelled=membership.status == MembershipStatus.cancelled,
        ),
    )


def _last_payment(payment: Payment | None) -> MemberLastPayment | None:
    if payment is None:
        return None
    return MemberLastPayment(
        payment_id=payment.id,
        amount_cents=payment.amount_cents,
        status=payment.status,
        created_at=payment.created_at,
    )
