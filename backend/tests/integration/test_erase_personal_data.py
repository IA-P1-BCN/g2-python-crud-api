"""Erase a member's personal data (specs/518-erase-member-personal-data.md)."""

from datetime import UTC, date, datetime

import pyotp
from sqlalchemy import select

from app.models.booking import Booking, BookingStatus
from app.models.membership import Membership
from app.models.payment import Payment, PaymentStatus
from app.models.user import User

API = "/api/v1"
FIXTURE_PASSWORD = "password123"


def _erase(client, user_id: int):
    return client.delete(f"{API}/users/{user_id}/personal-data")


def _deactivate(client, user_id: int) -> None:
    assert client.delete(f"{API}/users/{user_id}").status_code == 204


def test_erasing_anonymizes_a_deactivated_member(client, db_session, member) -> None:
    member.totp_secret = pyotp.random_base32()
    member.totp_enabled_at = datetime.now(UTC)
    member.email_verified_at = datetime.now(UTC)
    db_session.commit()
    old_hash = member.hashed_password
    _deactivate(client, member.id)

    response = _erase(client, member.id)

    assert response.status_code == 204
    db_session.refresh(member)
    assert member.email == f"socio-eliminado-{member.id}@athletica.dev"
    assert member.full_name == "Socio eliminado"
    assert member.hashed_password != old_hash
    assert member.totp_secret is None
    assert member.totp_enabled_at is None
    assert member.email_verified_at is None
    assert member.personal_data_erased_at is not None
    assert member.is_active is False


def test_the_response_shows_when_the_data_was_erased(client, member) -> None:
    _deactivate(client, member.id)
    _erase(client, member.id)

    body = client.get(f"{API}/users/{member.id}").json()

    assert body["personal_data_erased_at"] is not None
    assert body["full_name"] == "Socio eliminado"


def test_bookings_memberships_and_payments_are_kept(
    client, db_session, member, schedule, active_membership, next_date_for_weekday
) -> None:
    booking = Booking(
        member_id=member.id,
        schedule_id=schedule.id,
        booking_date=next_date_for_weekday(schedule.day_of_week),
        status=BookingStatus.confirmed,
    )
    payment = Payment(
        user_id=member.id,
        membership_id=active_membership.id,
        amount_cents=3999,
        status=PaymentStatus.paid,
    )
    db_session.add_all([booking, payment])
    db_session.commit()
    _deactivate(client, member.id)

    _erase(client, member.id)

    db_session.expire_all()
    assert db_session.execute(select(Booking).where(Booking.member_id == member.id)).first()
    assert db_session.execute(select(Payment).where(Payment.user_id == member.id)).first()
    assert db_session.execute(select(Membership).where(Membership.user_id == member.id)).first()


def test_the_old_email_and_password_no_longer_log_in(client, anon_client, member) -> None:
    old_email = member.email
    _deactivate(client, member.id)
    _erase(client, member.id)

    response = anon_client.post(
        f"{API}/auth/login", json={"email": old_email, "password": FIXTURE_PASSWORD}
    )

    assert response.status_code == 401


def test_an_active_member_must_be_deactivated_first(client, member) -> None:
    response = _erase(client, member.id)

    assert response.status_code == 409
    assert response.json() == {"detail": "Primero da de baja al socio", "code": "conflict"}


def test_only_members_can_be_erased(client, trainer) -> None:
    _deactivate(client, trainer.id)

    response = _erase(client, trainer.id)

    assert response.status_code == 400
    assert response.json()["detail"] == "Solo se pueden borrar los datos personales de un socio"


def test_erasing_twice_returns_409(client, member) -> None:
    _deactivate(client, member.id)
    _erase(client, member.id)

    response = _erase(client, member.id)

    assert response.status_code == 409
    assert response.json()["detail"] == "Los datos personales de este socio ya se borraron"


def test_an_unknown_user_returns_404(client) -> None:
    assert _erase(client, 9999).status_code == 404


def test_an_erased_member_cannot_be_reactivated(client, member) -> None:
    _deactivate(client, member.id)
    _erase(client, member.id)

    response = client.put(f"{API}/users/{member.id}", json={"is_active": True})

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "No se puede reactivar un socio con los datos personales borrados"
    )


def test_deactivating_stays_reversible_without_erasing(client, db_session, member) -> None:
    _deactivate(client, member.id)

    response = client.put(f"{API}/users/{member.id}", json={"is_active": True})

    assert response.status_code == 200
    assert response.json()["is_active"] is True
    assert db_session.get(User, member.id).email == "member@test.dev"


def test_the_anonymous_email_carries_the_id(client, member) -> None:
    """The anonymous email carries the id, so two erased members never collide."""
    _deactivate(client, member.id)
    _erase(client, member.id)

    assert client.get(f"{API}/users", params={"search": "socio-eliminado"}).json()["total"] == 1


def test_erasing_is_recorded_in_the_audit(client, member) -> None:
    _deactivate(client, member.id)
    _erase(client, member.id)

    audit = client.get(f"{API}/users/{member.id}/audit").json()

    assert audit["updated_by"] is not None
    assert date.fromisoformat(audit["updated_at"][:10]) == datetime.now(UTC).date()
