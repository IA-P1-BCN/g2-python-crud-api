"""Role x endpoint matrix: who may call each route. Id 9999 never belongs to the caller."""

import pytest

from app.core.security import create_access_token

API = "/api/v1"
OK = "allowed"

# (method, path, anonymous, member, trainer, admin)
PUBLIC = (OK, OK, OK, OK)
LOGGED_IN = (401, OK, OK, OK)
STAFF = (401, 403, OK, OK)
MEMBER_OR_ADMIN = (401, OK, 403, OK)
ADMIN = (401, 403, 403, OK)
# Data of another user: only an admin gets past the ownership check
OTHER_USER = (401, 403, 403, OK)

MATRIX = [
    ("GET", "/auth/me", *LOGGED_IN),
    ("GET", "/me/dashboard", *LOGGED_IN),
    # Membership plans: anyone reads, admin writes
    ("GET", "/membership-plans", *PUBLIC),
    ("GET", "/membership-plans/9999", *PUBLIC),
    ("POST", "/membership-plans", *ADMIN),
    ("PUT", "/membership-plans/9999", *ADMIN),
    ("DELETE", "/membership-plans/9999", *ADMIN),
    # Classes and schedules: anyone reads, staff writes
    ("GET", "/classes", *PUBLIC),
    ("GET", "/classes/9999", *PUBLIC),
    ("GET", "/classes/9999/schedules", *PUBLIC),
    ("POST", "/classes", *STAFF),
    ("PUT", "/classes/9999", *STAFF),
    ("DELETE", "/classes/9999", *STAFF),
    ("GET", "/class-schedules", *PUBLIC),
    ("GET", "/class-schedules/9999", *PUBLIC),
    ("GET", "/class-schedules/9999/availability?on_date=2026-10-12", *PUBLIC),
    ("POST", "/class-schedules", *STAFF),
    ("PUT", "/class-schedules/9999", *STAFF),
    ("DELETE", "/class-schedules/9999", *STAFF),
    ("GET", "/class-schedules/9999/bookings", *STAFF),
    # Rooms: logged-in users read, admin writes
    ("GET", "/rooms", *LOGGED_IN),
    ("GET", "/rooms/9999", *LOGGED_IN),
    ("POST", "/rooms", *ADMIN),
    ("PUT", "/rooms/9999", *ADMIN),
    ("DELETE", "/rooms/9999", *ADMIN),
    # Users
    ("GET", "/users", *STAFF),
    ("POST", "/users", *ADMIN),
    ("GET", "/users/9999", *OTHER_USER),
    ("PUT", "/users/9999", *ADMIN),
    ("DELETE", "/users/9999", *ADMIN),
    ("GET", "/users/9999/memberships", *OTHER_USER),
    ("GET", "/users/9999/bookings", *OTHER_USER),
    # Memberships
    ("GET", "/memberships", *ADMIN),
    ("POST", "/memberships", *ADMIN),
    ("GET", "/memberships/9999", *LOGGED_IN),
    ("PUT", "/memberships/9999", *ADMIN),
    ("DELETE", "/memberships/9999", *ADMIN),
    # Bookings: members book and cancel, staff sees the lists
    ("GET", "/bookings", *STAFF),
    ("POST", "/bookings", *MEMBER_OR_ADMIN),
    ("GET", "/bookings/9999", *LOGGED_IN),
    ("DELETE", "/bookings/9999", *MEMBER_OR_ADMIN),
    # Payments and exports: admin only
    ("GET", "/payments", *ADMIN),
    ("POST", "/payments", *ADMIN),
    ("GET", "/payments/9999", *ADMIN),
    ("PUT", "/payments/9999", *ADMIN),
    ("DELETE", "/payments/9999", *ADMIN),
    ("GET", "/export/members.csv", *ADMIN),
    ("GET", "/admin/dashboard", *ADMIN),
    ("GET", "/export/bookings.csv", *ADMIN),
]

ROLES = ["anonymous", "member", "trainer", "admin"]
CASES = [
    pytest.param(method, path, role, expected, id=f"{role}-{method}-{path}")
    for method, path, *by_role in MATRIX
    for role, expected in zip(ROLES, by_role, strict=True)
]


@pytest.mark.parametrize(("method", "path", "role", "expected"), CASES)
def test_role_permissions(
    anon_client, request, method: str, path: str, role: str, expected
) -> None:
    headers = {}
    if role != "anonymous":
        user = request.getfixturevalue(role)
        token = create_access_token(user.id, user.role.value)
        headers["Authorization"] = f"Bearer {token}"
    body = {} if method in ("POST", "PUT") else None

    response = anon_client.request(method, f"{API}{path}", headers=headers, json=body)

    if expected == OK:
        # The request got past the guard; 404 or 422 only mean the id or the body are fake.
        assert response.status_code not in (401, 403), response.text
    else:
        assert response.status_code == expected, response.text
