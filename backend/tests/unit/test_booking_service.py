from datetime import date, time, timedelta

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError
from app.core.security import hash_password
from app.models.booking import BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate
from app.services import booking_service


def _member_with_membership(db: Session, plan: MembershipPlan, email: str) -> User:
    user = User(
        email=email,
        full_name="Socio Extra",
        role=UserRole.member,
        hashed_password=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    today = date.today()
    db.add(
        Membership(
            user_id=user.id,
            plan_id=plan.id,
            start_date=today,
            end_date=today + timedelta(days=plan.duration_days),
            status=MembershipStatus.active,
        )
    )
    db.commit()
    return user


def test_booking_requires_active_membership(db_session, member, schedule) -> None:
    with pytest.raises(BusinessRuleError):
        booking_service.create_booking(
            db_session,
            BookingCreate(
                member_id=member.id,
                schedule_id=schedule.id,
                booking_date=date.today(),
            ),
        )


def test_booking_is_confirmed(db_session, member, schedule, active_membership) -> None:
    booking = booking_service.create_booking(
        db_session,
        BookingCreate(
            member_id=member.id, schedule_id=schedule.id, booking_date=date.today()
        ),
    )
    assert booking.status == BookingStatus.confirmed


def test_capacity_rule(db_session, plan, schedule) -> None:
    # gym_class.capacity == 2
    first = _member_with_membership(db_session, plan, "a@test.dev")
    second = _member_with_membership(db_session, plan, "b@test.dev")
    third = _member_with_membership(db_session, plan, "c@test.dev")

    payload = {"schedule_id": schedule.id, "booking_date": date.today()}
    booking_service.create_booking(db_session, BookingCreate(member_id=first.id, **payload))
    booking_service.create_booking(db_session, BookingCreate(member_id=second.id, **payload))

    with pytest.raises(ConflictError):
        booking_service.create_booking(
            db_session, BookingCreate(member_id=third.id, **payload)
        )


def test_overlap_rule(db_session, member, active_membership, gym_class) -> None:
    first = ClassSchedule(
        class_id=gym_class.id,
        day_of_week=0,
        start_time=time(10, 0),
        end_time=time(11, 0),
        room_id=None,
    )
    second = ClassSchedule(
        class_id=gym_class.id,
        day_of_week=0,
        start_time=time(10, 30),
        end_time=time(11, 30),
        room_id=None,
    )
    db_session.add_all([first, second])
    db_session.commit()
    db_session.refresh(first)
    db_session.refresh(second)

    booking_service.create_booking(
        db_session,
        BookingCreate(member_id=member.id, schedule_id=first.id, booking_date=date.today()),
    )
    with pytest.raises(ConflictError):
        booking_service.create_booking(
            db_session,
            BookingCreate(
                member_id=member.id, schedule_id=second.id, booking_date=date.today()
            ),
        )


def test_cancel_booking(db_session, member, schedule, active_membership) -> None:
    booking = booking_service.create_booking(
        db_session,
        BookingCreate(
            member_id=member.id, schedule_id=schedule.id, booking_date=date.today()
        ),
    )
    cancelled = booking_service.cancel_booking(db_session, booking.id)
    assert cancelled.status == BookingStatus.cancelled

    with pytest.raises(ConflictError):
        booking_service.cancel_booking(db_session, booking.id)
