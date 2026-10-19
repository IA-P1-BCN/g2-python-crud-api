from datetime import date, timedelta

import pytest

from app.core.exceptions import BusinessRuleError
from app.models.membership import MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.schemas.membership import MembershipCreate
from app.services import membership_service


def test_compute_status_active() -> None:
    status = membership_service.compute_status(
        date(2026, 1, 1), date(2026, 1, 31), today=date(2026, 1, 15)
    )
    assert status == MembershipStatus.active


def test_compute_status_expired() -> None:
    status = membership_service.compute_status(
        date(2026, 1, 1), date(2026, 1, 31), today=date(2026, 2, 1)
    )
    assert status == MembershipStatus.expired


def test_compute_status_cancelled() -> None:
    status = membership_service.compute_status(
        date(2026, 1, 1), date(2026, 1, 31), today=date(2026, 1, 15), cancelled=True
    )
    assert status == MembershipStatus.cancelled


def test_create_membership_computes_end_date(db_session, member, plan) -> None:
    start = date.today()
    membership = membership_service.create_membership(
        db_session,
        MembershipCreate(user_id=member.id, plan_id=plan.id, start_date=start),
    )

    assert membership.end_date == start + timedelta(days=plan.duration_days)
    assert membership.status == MembershipStatus.active


def test_create_membership_rejects_inactive_plan(db_session, member) -> None:
    inactive = MembershipPlan(
        name="Inactivo", price_cents=1000, duration_days=10, is_active=False
    )
    db_session.add(inactive)
    db_session.commit()
    db_session.refresh(inactive)

    with pytest.raises(BusinessRuleError):
        membership_service.create_membership(
            db_session,
            MembershipCreate(user_id=member.id, plan_id=inactive.id, start_date=date.today()),
        )


def test_get_active_for_user(db_session, active_membership, member) -> None:
    found = membership_service.get_active_for_user(db_session, member.id, date.today())
    assert found is not None
    assert found.id == active_membership.id

    future = date.today() + timedelta(days=365)
    assert membership_service.get_active_for_user(db_session, member.id, future) is None
