"""Ownership rules: members reach only their own data, trainers only their own classes."""

from datetime import date, time

import pytest
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.models.booking import Booking
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.user import User, UserRole

API = "/api/v1"


def _auth(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}


def _add(db: Session, instance):
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance


def _user(db: Session, email: str, role: UserRole) -> User:
    return _add(
        db,
        User(
            email=email,
            full_name=email,
            role=role,
            hashed_password=hash_password("password123"),
        ),
    )


@pytest.fixture()
def other_member(db_session) -> User:
    return _user(db_session, "other-member@test.dev", UserRole.member)


@pytest.fixture()
def other_trainer(db_session) -> User:
    return _user(db_session, "other-trainer@test.dev", UserRole.trainer)


@pytest.fixture()
def other_class(db_session, other_trainer, room) -> GymClass:
    return _add(
        db_session,
        GymClass(name="Boxing", capacity=5, trainer_id=other_trainer.id, room_id=room.id),
    )


@pytest.fixture()
def other_schedule(db_session, other_class, room) -> ClassSchedule:
    return _add(
        db_session,
        ClassSchedule(
            class_id=other_class.id,
            day_of_week=3,
            start_time=time(17, 0),
            end_time=time(18, 0),
            room_id=room.id,
        ),
    )


@pytest.fixture()
def booking(db_session, member, schedule) -> Booking:
    """Booking of `member` in a class taught by `trainer`."""
    return _add(
        db_session,
        Booking(member_id=member.id, schedule_id=schedule.id, booking_date=date(2026, 10, 5)),
    )


@pytest.fixture()
def other_booking(db_session, other_member, other_schedule) -> Booking:
    """Booking of `other_member` in a class taught by `other_trainer`."""
    return _add(
        db_session,
        Booking(
            member_id=other_member.id,
            schedule_id=other_schedule.id,
            booking_date=date(2026, 10, 8),
        ),
    )


# Members: own profile, memberships and bookings only


def test_member_reads_own_profile_but_not_another(anon_client, member, other_member) -> None:
    own = anon_client.get(f"{API}/users/{member.id}", headers=_auth(member))
    other = anon_client.get(f"{API}/users/{other_member.id}", headers=_auth(member))

    assert own.status_code == 200
    assert other.status_code == 403
    assert other.json()["code"] == "forbidden"


@pytest.mark.parametrize("resource", ["memberships", "bookings"])
def test_member_lists_own_data_but_not_another_members(
    anon_client, member, other_member, resource: str
) -> None:
    own = anon_client.get(f"{API}/users/{member.id}/{resource}", headers=_auth(member))
    other = anon_client.get(f"{API}/users/{other_member.id}/{resource}", headers=_auth(member))

    assert own.status_code == 200
    assert other.status_code == 403


def test_member_reads_own_membership_but_not_another(
    anon_client, member, other_member, active_membership
) -> None:
    url = f"{API}/memberships/{active_membership.id}"

    assert anon_client.get(url, headers=_auth(member)).status_code == 200
    assert anon_client.get(url, headers=_auth(other_member)).status_code == 403


def test_member_books_for_themselves(
    anon_client, member, schedule, active_membership, next_date_for_weekday
) -> None:
    payload = {
        "member_id": member.id,
        "schedule_id": schedule.id,
        "booking_date": next_date_for_weekday(schedule.day_of_week).isoformat(),
    }

    response = anon_client.post(f"{API}/bookings", json=payload, headers=_auth(member))

    assert response.status_code == 201
    assert response.json()["member_id"] == member.id


def test_member_cannot_book_for_another_member(
    anon_client, member, other_member, schedule, active_membership
) -> None:
    payload = {
        "member_id": member.id,
        "schedule_id": schedule.id,
        "booking_date": date.today().isoformat(),
    }

    response = anon_client.post(f"{API}/bookings", json=payload, headers=_auth(other_member))

    assert response.status_code == 403
    assert response.json()["code"] == "forbidden"


def test_member_reads_own_booking_but_not_another(
    anon_client, member, booking, other_booking
) -> None:
    own = anon_client.get(f"{API}/bookings/{booking.id}", headers=_auth(member))
    other = anon_client.get(f"{API}/bookings/{other_booking.id}", headers=_auth(member))

    assert own.status_code == 200
    assert other.status_code == 403


def test_member_cancels_own_booking(anon_client, member, booking) -> None:
    response = anon_client.delete(f"{API}/bookings/{booking.id}", headers=_auth(member))

    assert response.status_code == 204


def test_member_cannot_cancel_another_members_booking(
    anon_client, member, other_booking, db_session
) -> None:
    response = anon_client.delete(f"{API}/bookings/{other_booking.id}", headers=_auth(member))

    assert response.status_code == 403
    db_session.refresh(other_booking)
    assert other_booking.status.value == "confirmed"


# Trainers: own classes, their schedules and their bookings only


def test_trainer_lists_members_only(anon_client, trainer, member, other_trainer, admin) -> None:
    response = anon_client.get(f"{API}/users", headers=_auth(trainer))

    assert response.status_code == 200
    assert {item["role"] for item in response.json()["items"]} == {"member"}


@pytest.mark.parametrize("role", ["admin", "trainer"])
def test_trainer_cannot_list_other_roles(anon_client, trainer, role: str) -> None:
    response = anon_client.get(f"{API}/users", params={"role": role}, headers=_auth(trainer))

    assert response.status_code == 403


def test_trainer_cannot_read_a_single_member_profile(anon_client, trainer, member) -> None:
    response = anon_client.get(f"{API}/users/{member.id}", headers=_auth(trainer))

    assert response.status_code == 403


def test_trainer_creates_a_class_in_their_own_name(anon_client, trainer) -> None:
    payload = {"name": "Spinning", "capacity": 12, "trainer_id": trainer.id}

    response = anon_client.post(f"{API}/classes", json=payload, headers=_auth(trainer))

    assert response.status_code == 201
    assert response.json()["trainer_id"] == trainer.id


def test_trainer_cannot_create_a_class_for_another_trainer(
    anon_client, trainer, other_trainer
) -> None:
    payload = {"name": "Spinning", "capacity": 12, "trainer_id": other_trainer.id}

    response = anon_client.post(f"{API}/classes", json=payload, headers=_auth(trainer))

    assert response.status_code == 403


def test_trainer_edits_own_class_but_not_another_trainers(
    anon_client, trainer, gym_class, other_class
) -> None:
    own = anon_client.put(
        f"{API}/classes/{gym_class.id}", json={"capacity": 8}, headers=_auth(trainer)
    )
    other = anon_client.put(
        f"{API}/classes/{other_class.id}", json={"capacity": 8}, headers=_auth(trainer)
    )

    assert own.status_code == 200
    assert other.status_code == 403


def test_trainer_cannot_hand_own_class_to_another_trainer(
    anon_client, trainer, gym_class, other_trainer
) -> None:
    response = anon_client.put(
        f"{API}/classes/{gym_class.id}",
        json={"trainer_id": other_trainer.id},
        headers=_auth(trainer),
    )

    assert response.status_code == 403


def test_trainer_deletes_own_class_but_not_another_trainers(
    anon_client, trainer, gym_class, other_class
) -> None:
    other = anon_client.delete(f"{API}/classes/{other_class.id}", headers=_auth(trainer))
    own = anon_client.delete(f"{API}/classes/{gym_class.id}", headers=_auth(trainer))

    assert other.status_code == 403
    assert own.status_code == 204


def test_trainer_schedules_only_own_classes(
    anon_client, trainer, gym_class, other_class, room
) -> None:
    def payload(class_id: int) -> dict:
        return {
            "class_id": class_id,
            "day_of_week": 5,
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "room_id": room.id,
        }

    other = anon_client.post(
        f"{API}/class-schedules", json=payload(other_class.id), headers=_auth(trainer)
    )
    own = anon_client.post(
        f"{API}/class-schedules", json=payload(gym_class.id), headers=_auth(trainer)
    )

    assert other.status_code == 403
    assert own.status_code == 201


def test_trainer_cannot_edit_or_delete_another_trainers_schedule(
    anon_client, trainer, other_schedule
) -> None:
    url = f"{API}/class-schedules/{other_schedule.id}"

    edited = anon_client.put(url, json={"day_of_week": 1}, headers=_auth(trainer))
    deleted = anon_client.delete(url, headers=_auth(trainer))

    assert edited.status_code == 403
    assert deleted.status_code == 403


def test_trainer_cannot_move_own_schedule_to_another_trainers_class(
    anon_client, trainer, schedule, other_class
) -> None:
    response = anon_client.put(
        f"{API}/class-schedules/{schedule.id}",
        json={"class_id": other_class.id},
        headers=_auth(trainer),
    )

    assert response.status_code == 403


def test_trainer_sees_bookings_of_own_sessions_only(
    anon_client, trainer, schedule, other_schedule, booking, other_booking
) -> None:
    own = anon_client.get(f"{API}/class-schedules/{schedule.id}/bookings", headers=_auth(trainer))
    other = anon_client.get(
        f"{API}/class-schedules/{other_schedule.id}/bookings", headers=_auth(trainer)
    )

    assert own.status_code == 200
    assert [item["id"] for item in own.json()["items"]] == [booking.id]
    assert other.status_code == 403


def test_trainer_bookings_list_is_limited_to_own_classes(
    anon_client, trainer, booking, other_booking
) -> None:
    response = anon_client.get(f"{API}/bookings", headers=_auth(trainer))

    assert response.status_code == 200
    assert [item["id"] for item in response.json()["items"]] == [booking.id]


def test_trainer_reads_a_booking_of_own_class_but_not_of_another(
    anon_client, trainer, booking, other_booking
) -> None:
    own = anon_client.get(f"{API}/bookings/{booking.id}", headers=_auth(trainer))
    other = anon_client.get(f"{API}/bookings/{other_booking.id}", headers=_auth(trainer))

    assert own.status_code == 200
    assert other.status_code == 403


# Admins are not limited by ownership


def test_admin_reaches_everyones_data(
    anon_client, admin, member, other_class, booking, other_booking
) -> None:
    headers = _auth(admin)

    assert anon_client.get(f"{API}/users/{member.id}", headers=headers).status_code == 200
    assert anon_client.get(f"{API}/users/{member.id}/bookings", headers=headers).status_code == 200
    assert anon_client.get(f"{API}/bookings/{other_booking.id}", headers=headers).status_code == 200
    assert anon_client.get(f"{API}/bookings", headers=headers).json()["total"] == 2
    edited = anon_client.put(
        f"{API}/classes/{other_class.id}", json={"capacity": 9}, headers=headers
    )
    assert edited.status_code == 200
    assert anon_client.delete(f"{API}/bookings/{booking.id}", headers=headers).status_code == 204
