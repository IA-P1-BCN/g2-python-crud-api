import csv
import io
from datetime import date

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole


def _read_csv(text: str) -> list[list[str]]:
    return list(csv.reader(io.StringIO(text)))


def test_export_members_headers_rows_and_content_type(
    client: TestClient, admin: User, trainer: User, member: User
) -> None:
    response = client.get("/api/v1/export/members.csv")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"] == 'attachment; filename="members.csv"'

    rows = _read_csv(response.text)
    assert rows[0] == ["id", "email", "full_name", "role", "is_active"]
    assert len(rows) == 4  # header + admin + trainer + member
    assert {row[3] for row in rows[1:]} == {"admin", "trainer", "member"}


def test_export_members_filters_by_role(
    client: TestClient, admin: User, trainer: User, member: User
) -> None:
    response = client.get("/api/v1/export/members.csv", params={"role": "trainer"})

    rows = _read_csv(response.text)
    assert rows[0] == ["id", "email", "full_name", "role", "is_active"]
    assert [row[1] for row in rows[1:]] == [trainer.email]


def test_export_members_is_utf8(client: TestClient, db_session: Session) -> None:
    db_session.add(
        User(
            email="jose@test.dev",
            full_name="José Álvarez",
            role=UserRole.member,
            hashed_password="x",
        )
    )
    db_session.commit()

    response = client.get("/api/v1/export/members.csv")

    assert response.content.decode("utf-8").count("José Álvarez") == 1


def test_export_bookings_headers(
    client: TestClient, member: User, schedule, db_session: Session
) -> None:
    db_session.add(
        Booking(
            member_id=member.id,
            schedule_id=schedule.id,
            booking_date=date(2026, 1, 5),
            status=BookingStatus.confirmed,
        )
    )
    db_session.commit()

    response = client.get("/api/v1/export/bookings.csv")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"] == 'attachment; filename="bookings.csv"'

    rows = _read_csv(response.text)
    assert rows[0] == ["id", "member_id", "schedule_id", "booking_date", "status"]
    assert len(rows) == 2
    assert rows[1][3] == "2026-01-05"
    assert rows[1][4] == "confirmed"


def test_export_bookings_filters(
    client: TestClient, member: User, schedule, db_session: Session
) -> None:
    db_session.add_all(
        [
            Booking(
                member_id=member.id,
                schedule_id=schedule.id,
                booking_date=date(2026, 1, 5),
                status=BookingStatus.confirmed,
            ),
            Booking(
                member_id=member.id,
                schedule_id=schedule.id,
                booking_date=date(2026, 1, 6),
                status=BookingStatus.cancelled,
            ),
        ]
    )
    db_session.commit()

    by_status = _read_csv(
        client.get("/api/v1/export/bookings.csv", params={"status_filter": "cancelled"}).text
    )
    assert len(by_status) == 2
    assert by_status[1][4] == "cancelled"

    by_date = _read_csv(
        client.get("/api/v1/export/bookings.csv", params={"on_date": "2026-01-05"}).text
    )
    assert len(by_date) == 2
    assert by_date[1][3] == "2026-01-05"

    by_member = _read_csv(
        client.get("/api/v1/export/bookings.csv", params={"member_id": member.id}).text
    )
    assert len(by_member) == 3
