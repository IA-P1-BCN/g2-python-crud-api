"""Members list of the admin panel: each member with their plan and last payment."""

from datetime import UTC, date, datetime, timedelta

from sqlalchemy import event
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.payment import Payment, PaymentStatus
from app.models.user import User, UserRole
from app.schemas.user import UserFilters
from app.services import admin_member_service

MEMBERS_URL = "/api/v1/admin/members"
TODAY = date.today()


def _add(db: Session, instance):
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def _member(db: Session, email: str, **extra) -> User:
    return _add(
        db,
        User(
            email=email,
            full_name=extra.pop("full_name", "Socio Extra"),
            role=UserRole.member,
            hashed_password=hash_password("password123"),
            **extra,
        ),
    )


def _membership(
    db: Session, user: User, plan: MembershipPlan, start: date, end: date, **extra
) -> Membership:
    return _add(
        db, Membership(user_id=user.id, plan_id=plan.id, start_date=start, end_date=end, **extra)
    )


def _payment(db: Session, membership: Membership, amount_cents: int, **extra) -> Payment:
    return _add(
        db,
        Payment(
            user_id=membership.user_id,
            membership_id=membership.id,
            amount_cents=amount_cents,
            **extra,
        ),
    )


def _only_member(client) -> dict:
    body = client.get(MEMBERS_URL).json()
    assert body["total"] == 1
    return body["items"][0]


def test_member_with_a_membership_in_force_and_payments(
    client, db_session, member, active_membership, plan
) -> None:
    _payment(
        db_session,
        active_membership,
        1000,
        status=PaymentStatus.failed,
        created_at=datetime(2026, 9, 1, tzinfo=UTC),
    )
    last = _payment(
        db_session,
        active_membership,
        3999,
        status=PaymentStatus.paid,
        created_at=datetime(2026, 10, 1, tzinfo=UTC),
    )

    response = client.get(MEMBERS_URL)

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["id"] == member.id
    assert item["email"] == member.email
    assert item["full_name"] == member.full_name
    assert item["role"] == "member"
    assert item["is_active"] is True
    assert item["membership"] == {
        "membership_id": active_membership.id,
        "plan_id": plan.id,
        "plan_name": plan.name,
        "start_date": active_membership.start_date.isoformat(),
        "end_date": active_membership.end_date.isoformat(),
        "status": "active",
    }
    assert item["last_payment"]["payment_id"] == last.id
    assert item["last_payment"]["amount_cents"] == 3999
    assert item["last_payment"]["status"] == "paid"
    assert item["last_payment"]["created_at"].startswith("2026-10-01")


def test_member_without_membership_or_payments(client, member) -> None:
    item = _only_member(client)

    assert item["id"] == member.id
    assert item["membership"] is None
    assert item["last_payment"] is None


def test_never_exposes_the_password(client, member) -> None:
    item = _only_member(client)

    assert "password" not in item
    assert "hashed_password" not in item


def test_membership_in_force_wins_over_one_that_ends_later(
    client, db_session, member, plan
) -> None:
    in_force = _membership(db_session, member, plan, TODAY, TODAY + timedelta(days=5))
    _membership(db_session, member, plan, TODAY + timedelta(days=30), TODAY + timedelta(days=60))

    assert _only_member(client)["membership"]["membership_id"] == in_force.id


def test_without_one_in_force_shows_the_last_membership_as_expired(
    client, db_session, member, plan
) -> None:
    _membership(db_session, member, plan, TODAY - timedelta(days=90), TODAY - timedelta(days=60))
    latest = _membership(
        db_session,
        member,
        plan,
        TODAY - timedelta(days=40),
        TODAY - timedelta(days=10),
        status=MembershipStatus.active,
    )

    membership = _only_member(client)["membership"]

    assert membership["membership_id"] == latest.id
    assert membership["status"] == "expired"


def test_a_cancelled_membership_is_shown_as_cancelled(client, db_session, member, plan) -> None:
    _membership(
        db_session,
        member,
        plan,
        TODAY,
        TODAY + timedelta(days=30),
        status=MembershipStatus.cancelled,
    )

    assert _only_member(client)["membership"]["status"] == "cancelled"


def test_each_member_gets_their_own_plan_and_payment(
    client, db_session, member, active_membership, plan
) -> None:
    other = _member(db_session, "otra@test.dev")
    premium = _add(db_session, MembershipPlan(name="Premium", price_cents=5999, duration_days=30))
    other_membership = _membership(db_session, other, premium, TODAY, TODAY + timedelta(days=30))
    _payment(db_session, active_membership, 3999)
    _payment(db_session, other_membership, 5999)

    items = {item["id"]: item for item in client.get(MEMBERS_URL).json()["items"]}

    assert items[member.id]["membership"]["plan_name"] == plan.name
    assert items[member.id]["last_payment"]["amount_cents"] == 3999
    assert items[other.id]["membership"]["plan_name"] == "Premium"
    assert items[other.id]["last_payment"]["amount_cents"] == 5999


def test_lists_only_members(client, member, trainer, admin) -> None:
    body = client.get(MEMBERS_URL).json()

    assert [item["id"] for item in body["items"]] == [member.id]


def test_the_role_filter_is_ignored(client, member, trainer) -> None:
    body = client.get(MEMBERS_URL, params={"role": "trainer"}).json()

    assert [item["id"] for item in body["items"]] == [member.id]


def test_filters_by_text_and_status(client, db_session, member) -> None:
    lucia = _member(db_session, "lucia@test.dev", full_name="Lucía Pérez")
    _member(
        db_session,
        "baja@test.dev",
        full_name="Lucía Baja",
        is_active=False,
        deactivated_at=datetime.now(UTC),
    )

    by_text = client.get(MEMBERS_URL, params={"search": "lucía"}).json()
    by_both = client.get(MEMBERS_URL, params={"search": "lucía", "is_active": True}).json()
    inactive = client.get(MEMBERS_URL, params={"is_active": False}).json()

    assert by_text["total"] == 2
    assert [item["id"] for item in by_both["items"]] == [lucia.id]
    assert inactive["total"] == 1
    assert inactive["items"][0]["email"] == "baja@test.dev"


def test_is_paginated(client, db_session, member) -> None:
    for number in range(4):
        _member(db_session, f"socio{number}@test.dev")

    body = client.get(MEMBERS_URL, params={"page": 2, "size": 2}).json()

    assert body["total"] == 5
    assert body["page"] == 2
    assert body["size"] == 2
    assert body["pages"] == 3
    assert len(body["items"]) == 2


def test_without_members_is_empty(client) -> None:
    body = client.get(MEMBERS_URL).json()

    assert body["total"] == 0
    assert body["items"] == []


def test_invalid_filters_return_422(client) -> None:
    response = client.get(MEMBERS_URL, params={"is_active": "quizas"})

    assert response.status_code == 422


def _count_queries(db_session: Session, members: int, plan: MembershipPlan) -> int:
    for number in range(members):
        user = _member(db_session, f"socio{number}-de-{members}@test.dev")
        membership = _membership(db_session, user, plan, TODAY, TODAY + timedelta(days=30))
        _payment(db_session, membership, 3999)
    db_session.expire_all()

    statements: list[str] = []

    def record(_conn, _cursor, statement, *_args) -> None:
        statements.append(statement)

    engine = db_session.get_bind()
    event.listen(engine, "before_cursor_execute", record)
    try:
        admin_member_service.list_members(db_session, page=1, size=100, filters=UserFilters())
    finally:
        event.remove(engine, "before_cursor_execute", record)
    return len(statements)


def test_the_number_of_queries_does_not_grow_with_the_members(db_session, plan) -> None:
    with_two = _count_queries(db_session, 2, plan)
    with_many = _count_queries(db_session, 12, plan)

    assert with_two == with_many
