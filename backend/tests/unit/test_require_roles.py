from collections.abc import Generator

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_roles
from app.core.exceptions import register_exception_handlers
from app.core.security import create_access_token
from app.models.user import User, UserRole

require_admin = require_roles(UserRole.admin)
require_staff = require_roles(UserRole.admin, UserRole.trainer)


@pytest.fixture()
def guarded_client(db_session: Session) -> Generator[TestClient, None, None]:
    app = FastAPI()
    register_exception_handlers(app)
    app.dependency_overrides[get_db] = lambda: db_session

    @app.get("/admin-only")
    def admin_only(user: User = Depends(require_admin)) -> dict[str, str]:
        return {"role": user.role.value}

    @app.get("/staff")
    def staff(user: User = Depends(require_staff)) -> dict[str, str]:
        return {"role": user.role.value}

    with TestClient(app) as client:
        yield client


def _bearer(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}


def test_allowed_role_gets_in_and_receives_the_user(guarded_client, admin) -> None:
    response = guarded_client.get("/admin-only", headers=_bearer(admin))

    assert response.status_code == 200
    assert response.json() == {"role": "admin"}


@pytest.mark.parametrize("fixture_name", ["trainer", "member"])
def test_other_roles_get_403(guarded_client, request, fixture_name: str) -> None:
    user = request.getfixturevalue(fixture_name)

    response = guarded_client.get("/admin-only", headers=_bearer(user))

    assert response.status_code == 403
    assert response.json()["code"] == "forbidden"


@pytest.mark.parametrize(
    ("fixture_name", "expected_status"),
    [("admin", 200), ("trainer", 200), ("member", 403)],
)
def test_several_roles_can_be_allowed(
    guarded_client, request, fixture_name: str, expected_status: int
) -> None:
    user = request.getfixturevalue(fixture_name)

    response = guarded_client.get("/staff", headers=_bearer(user))

    assert response.status_code == expected_status


def test_missing_token_gets_401_not_403(guarded_client) -> None:
    response = guarded_client.get("/admin-only")

    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized"


def test_role_comes_from_the_database_not_from_the_token(guarded_client, member) -> None:
    forged = create_access_token(member.id, "admin")

    response = guarded_client.get("/admin-only", headers={"Authorization": f"Bearer {forged}"})

    assert response.status_code == 403
