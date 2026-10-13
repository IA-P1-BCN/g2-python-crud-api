"""The user repository reads and writes; it never decides (specs/403-user-repository.md)."""

from datetime import UTC, date, datetime
from pathlib import Path

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.user import User, UserRole
from app.repositories import user_repository
from app.schemas.user import UserFilters

SERVICES_DIR = Path(__file__).resolve().parents[2] / "app" / "services"


def _new_user(email: str, **extra) -> User:
    return User(
        email=email,
        full_name=extra.pop("full_name", "Usuario Nuevo"),
        role=extra.pop("role", UserRole.member),
        hashed_password="not-a-real-hash",
        **extra,
    )


# get and get_by_email


def test_get_returns_the_user(db_session, member) -> None:
    assert user_repository.get(db_session, member.id) is member


def test_get_returns_none_for_an_unknown_id(db_session) -> None:
    assert user_repository.get(db_session, 999999) is None


def test_get_by_email_returns_the_user(db_session, member) -> None:
    assert user_repository.get_by_email(db_session, member.email) is member


def test_get_by_email_returns_none_for_an_unknown_email(db_session, member) -> None:
    assert user_repository.get_by_email(db_session, "nadie@test.dev") is None


# add and save


def test_add_stores_the_user_and_fills_the_generated_fields(db_session) -> None:
    user = user_repository.add(db_session, _new_user("nuevo@test.dev"))

    assert user.id is not None
    assert user.created_at is not None
    assert user.is_active is True
    assert user_repository.get_by_email(db_session, "nuevo@test.dev") is user


def test_save_writes_the_pending_changes(db_session, member) -> None:
    member.full_name = "Nombre Cambiado"

    user_repository.save(db_session, member)
    db_session.expire_all()

    assert user_repository.get(db_session, member.id).full_name == "Nombre Cambiado"


def test_add_does_not_check_that_the_email_is_free(db_session, member) -> None:
    # Uniqueness is a rule of the service; here only the database constraint speaks.
    with pytest.raises(IntegrityError):
        user_repository.add(db_session, _new_user(member.email))
    db_session.rollback()


# list_page, list_all and count


@pytest.fixture()
def people(db_session, admin, trainer, member) -> dict[str, User]:
    """The three fixture users plus two members: one signed up long ago, one signed off."""
    veteran = user_repository.add(
        db_session,
        _new_user(
            "lucia@test.dev",
            full_name="Lucía Pérez",
            created_at=datetime(2026, 1, 15, 12, 0, tzinfo=UTC),
        ),
    )
    gone = user_repository.add(
        db_session,
        _new_user(
            "baja@test.dev",
            full_name="Mario Baja",
            is_active=False,
            deactivated_at=datetime(2026, 3, 10, 9, 0, tzinfo=UTC),
        ),
    )
    return {"admin": admin, "trainer": trainer, "member": member, "veteran": veteran, "gone": gone}


def _emails(users: list[User]) -> set[str]:
    return {user.email for user in users}


def test_list_all_without_filters_returns_everyone_in_id_order(db_session, people) -> None:
    users = user_repository.list_all(db_session, UserFilters())

    assert [user.id for user in users] == sorted(user.id for user in people.values())


@pytest.mark.parametrize(
    ("filters", "expected"),
    [
        (UserFilters(role=UserRole.trainer), {"trainer"}),
        (UserFilters(is_active=False), {"gone"}),
        (UserFilters(search="LUCIA@"), {"veteran"}),
        (UserFilters(search="baja@"), {"gone"}),
        (UserFilters(created_to=date(2026, 1, 31)), {"veteran"}),
        (UserFilters(created_from=date(2026, 1, 15), created_to=date(2026, 1, 15)), {"veteran"}),
        (UserFilters(deactivated_from=date(2026, 3, 1)), {"gone"}),
        (UserFilters(deactivated_to=date(2026, 3, 9)), set()),
        (UserFilters(role=UserRole.member, is_active=True, search="pérez"), {"veteran"}),
    ],
)
def test_filters_select_the_right_users(
    db_session, people, filters: UserFilters, expected: set[str]
) -> None:
    wanted = {people[name].email for name in expected}

    assert _emails(user_repository.list_all(db_session, filters)) == wanted
    assert user_repository.count(db_session, filters) == len(wanted)


def test_list_page_returns_one_page_in_id_order(db_session, people) -> None:
    everyone = user_repository.list_all(db_session, UserFilters())

    first = user_repository.list_page(db_session, UserFilters(), page=1, size=2)
    last = user_repository.list_page(db_session, UserFilters(), page=3, size=2)

    assert first == everyone[:2]
    assert last == everyone[4:]


def test_list_page_past_the_end_is_empty(db_session, people) -> None:
    assert user_repository.list_page(db_session, UserFilters(), page=9, size=10) == []


def test_count_ignores_pagination(db_session, people) -> None:
    assert user_repository.count(db_session, UserFilters(role=UserRole.member)) == 3


# Architecture: services go through the repository to reach the users table


@pytest.mark.parametrize("pattern", ["select(User)", "select(User.", "db.get(User", "query(User"])
def test_services_do_not_query_the_users_table_themselves(pattern: str) -> None:
    offenders = [
        path.name for path in SERVICES_DIR.glob("*.py") if pattern in path.read_text("utf-8")
    ]

    assert offenders == [], f"These services query User directly: {offenders}"
