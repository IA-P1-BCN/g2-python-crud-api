from fastapi.testclient import TestClient

from app.main import app

HTTP_METHODS = {"get", "post", "put", "patch", "delete"}

MAIN_SCHEMAS = {
    "UserCreate",
    "UserRead",
    "LoginRequest",
    "RegisterRequest",
    "Token",
    "MembershipPlanCreate",
    "MembershipPlanRead",
    "MembershipCreate",
    "MembershipRead",
    "RoomCreate",
    "RoomRead",
    "GymClassCreate",
    "GymClassRead",
    "ClassScheduleCreate",
    "ClassScheduleRead",
    "BookingCreate",
    "BookingRead",
    "PaymentCreate",
    "PaymentRead",
}


def test_swagger_ui_is_available(client: TestClient) -> None:
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
    assert client.get("/openapi.json").status_code == 200


def test_every_operation_has_summary_and_description() -> None:
    schema = app.openapi()

    missing = [
        (method.upper(), path)
        for path, operations in schema["paths"].items()
        for method, operation in operations.items()
        if method in HTTP_METHODS
        and (not operation.get("summary") or not operation.get("description"))
    ]

    assert missing == []


def test_main_schemas_define_examples() -> None:
    schemas = app.openapi()["components"]["schemas"]

    for name in MAIN_SCHEMAS:
        assert schemas[name].get("examples"), f"{name} no define ejemplos"
