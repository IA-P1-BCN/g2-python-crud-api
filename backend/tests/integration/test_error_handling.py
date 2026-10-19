"""Every error leaves the API with the same shape: {"detail": ..., "code": ...}."""

import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.exceptions import (
    AppError,
    AuthenticationError,
    BusinessRuleError,
    ConflictError,
    InvalidDataError,
    NotFoundError,
    PermissionDeniedError,
    register_exception_handlers,
)


def _assert_error_shape(response, status: int, code: str) -> None:
    assert response.status_code == status
    body = response.json()
    assert set(body) == {"detail", "code"}
    assert body["code"] == code
    assert body["detail"]


# Errors raised by the framework


def test_unknown_route_returns_404_in_the_api_format(client) -> None:
    _assert_error_shape(client.get("/api/v1/does-not-exist"), 404, "not_found")


def test_wrong_method_returns_405_in_the_api_format(client) -> None:
    _assert_error_shape(client.post("/health"), 405, "method_not_allowed")


def test_invalid_path_parameter_returns_422_in_the_api_format(client) -> None:
    _assert_error_shape(client.get("/api/v1/classes/not-a-number"), 422, "validation_error")


def test_invalid_body_returns_422_with_the_failing_fields(client) -> None:
    response = client.post("/api/v1/rooms", json={"name": "", "capacity": 0})

    _assert_error_shape(response, 422, "validation_error")
    failing = {error["loc"][-1] for error in response.json()["detail"]}
    assert failing == {"name", "capacity"}


# Domain errors


@pytest.mark.parametrize(
    ("error", "status", "code"),
    [
        (AppError("base"), 400, "app_error"),
        (BusinessRuleError("rule"), 400, "business_rule"),
        (AuthenticationError("auth"), 401, "unauthorized"),
        (PermissionDeniedError("denied"), 403, "forbidden"),
        (NotFoundError("missing"), 404, "not_found"),
        (ConflictError("conflict"), 409, "conflict"),
        (InvalidDataError("invalid"), 422, "validation_error"),
    ],
)
def test_each_domain_error_maps_to_its_status_and_code(
    error: AppError, status: int, code: str
) -> None:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/fail")
    def fail() -> None:
        raise error

    response = TestClient(app).get("/fail")

    _assert_error_shape(response, status, code)
    assert response.json()["detail"] == error.detail


def test_domain_errors_are_logged_with_request_context(
    client, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.WARNING, logger="app.core.exceptions"):
        client.get("/api/v1/rooms/9999")

    [record] = [r for r in caplog.records if r.name == "app.core.exceptions"]
    assert record.levelno == logging.WARNING
    message = record.getMessage()
    assert "GET /api/v1/rooms/9999" in message
    assert "404 not_found" in message


# Unexpected errors


@pytest.fixture()
def failing_client() -> TestClient:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("secret database password in the trace")

    return TestClient(app, raise_server_exceptions=False)


def test_unexpected_error_returns_500_without_leaking_details(failing_client) -> None:
    response = failing_client.get("/boom")

    _assert_error_shape(response, 500, "internal_error")
    assert "secret" not in response.text
    assert "Traceback" not in response.text
    assert "RuntimeError" not in response.text


def test_unexpected_error_is_logged_with_its_traceback(
    failing_client, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.ERROR, logger="app.core.exceptions"):
        failing_client.get("/boom")

    [record] = [r for r in caplog.records if r.name == "app.core.exceptions"]
    assert record.levelno == logging.ERROR
    assert "GET /boom" in record.getMessage()
    assert record.exc_info is not None
