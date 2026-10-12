"""Pagination limits shared by every list endpoint, and the filters without a test of their own."""

from datetime import date, timedelta

import pytest

from app.models.booking import Booking, BookingStatus
from app.models.membership import Membership, MembershipStatus

API = "/api/v1"

LIST_ENDPOINTS = [
    "/users",
    "/membership-plans",
    "/memberships",
    "/rooms",
    "/classes",
    "/class-schedules",
    "/bookings",
    "/payments",
    "/admin/members",
]

MONDAY = date(2026, 10, 12)


# Pagination: the same contract on every list


@pytest.mark.parametrize("path", LIST_ENDPOINTS)
def test_list_uses_the_default_page_and_size(client, path: str) -> None:
    response = client.get(f"{API}{path}")

    assert response.status_code == 200
    body = response.json()
    assert body["page"] == 1
    assert body["size"] == 10
    assert set(body) == {"items", "total", "page", "size", "pages"}


@pytest.mark.parametrize("path", LIST_ENDPOINTS)
def test_list_accepts_the_maximum_size(client, path: str) -> None:
    response = client.get(f"{API}{path}", params={"size": 100})

    assert response.status_code == 200
    assert response.json()["size"] == 100


@pytest.mark.parametrize("path", LIST_ENDPOINTS)
@pytest.mark.parametrize(
    "params",
    [{"size": 101}, {"size": 0}, {"size": -1}, {"page": 0}, {"page": -1}, {"page": "dos"}],
)
def test_list_rejects_pagination_out_of_range(client, path: str, params: dict) -> None:
    response = client.get(f"{API}{path}", params=params)

    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


@pytest.mark.parametrize("path", LIST_ENDPOINTS)
def test_a_page_past_the_last_one_is_empty_but_keeps_the_total(client, path: str) -> None:
    total = client.get(f"{API}{path}").json()["total"]

    body = client.get(f"{API}{path}", params={"page": 50}).json()

    assert body["items"] == []
    assert body["total"] == total
    assert body["page"] == 50


def test_pages_is_the_total_split_by_size(client) -> None:
    for number in range(5):
        client.post(f"{API}/rooms", json={"name": f"Sala {number}", "capacity": 10})

    body = client.get(f"{API}/rooms", params={"size": 2}).json()

    assert body["total"] == 5
    assert body["pages"] == 3
    assert len(body["items"]) == 2


def test_an_empty_list_still_has_one_page(client) -> None:
    body = client.get(f"{API}/rooms").json()

    assert body["total"] == 0
    assert body["pages"] == 1


# Memberships: filter by status


def test_list_memberships_filters_by_status(client, db_session, member, plan) -> None:
    for status in (MembershipStatus.active, MembershipStatus.cancelled, MembershipStatus.expired):
        db_session.add(
            Membership(
                user_id=member.id,
                plan_id=plan.id,
                start_date=MONDAY,
                end_date=MONDAY + timedelta(days=30),
                status=status,
            )
        )
    db_session.commit()

    body = client.get(f"{API}/memberships", params={"status_filter": "cancelled"}).json()

    assert body["total"] == 1
    assert body["items"][0]["status"] == "cancelled"


def test_list_memberships_with_an_invalid_status_returns_422(client) -> None:
    response = client.get(f"{API}/memberships", params={"status_filter": "pausada"})

    assert response.status_code == 422


# Bookings: filter by status, date, member and schedule


@pytest.fixture()
def bookings(db_session, schedule, member, trainer) -> dict[str, Booking]:
    """Three bookings of the same schedule that differ in one thing each."""
    created = {
        "confirmed": Booking(member_id=member.id, schedule_id=schedule.id, booking_date=MONDAY),
        "cancelled": Booking(
            member_id=member.id,
            schedule_id=schedule.id,
            booking_date=MONDAY,
            status=BookingStatus.cancelled,
        ),
        "next_week": Booking(
            member_id=trainer.id,
            schedule_id=schedule.id,
            booking_date=MONDAY + timedelta(days=7),
        ),
    }
    db_session.add_all(created.values())
    db_session.commit()
    return created


def _booking_ids(client, **params) -> set[int]:
    body = client.get(f"{API}/bookings", params=params).json()
    return {item["id"] for item in body["items"]}


def test_list_bookings_without_filters_returns_all(client, bookings) -> None:
    assert _booking_ids(client) == {booking.id for booking in bookings.values()}


def test_list_bookings_filters_by_status(client, bookings) -> None:
    assert _booking_ids(client, status_filter="cancelled") == {bookings["cancelled"].id}


def test_list_bookings_filters_by_date(client, bookings) -> None:
    next_week = (MONDAY + timedelta(days=7)).isoformat()

    assert _booking_ids(client, on_date=next_week) == {bookings["next_week"].id}


def test_list_bookings_filters_by_member(client, bookings, trainer) -> None:
    assert _booking_ids(client, member_id=trainer.id) == {bookings["next_week"].id}


def test_list_bookings_filters_by_schedule(client, bookings, schedule) -> None:
    assert len(_booking_ids(client, schedule_id=schedule.id)) == 3
    assert _booking_ids(client, schedule_id=schedule.id + 1) == set()


def test_list_bookings_combines_filters(client, bookings) -> None:
    ids = _booking_ids(client, status_filter="confirmed", on_date=MONDAY.isoformat())

    assert ids == {bookings["confirmed"].id}


@pytest.mark.parametrize(
    "params",
    [{"status_filter": "pendiente"}, {"on_date": "ayer"}, {"member_id": "uno"}],
)
def test_list_bookings_with_invalid_filters_returns_422(client, params: dict) -> None:
    response = client.get(f"{API}/bookings", params=params)

    assert response.status_code == 422
