"""Every operation documents the errors it can return (specs/402-error-responses-in-openapi.md)."""

import re

import pytest

from app.main import app
from tests.integration.test_permissions import MATRIX

API = "/api/v1"
ERROR_CODES = {"400", "401", "403", "404", "409", "422", "429"}
ERROR_SCHEMAS = {
    "#/components/schemas/ErrorResponse",
    "#/components/schemas/ValidationErrorResponse",
}
SCHEMA = app.openapi()
OPERATIONS = [
    pytest.param(method.upper(), path, operation, id=f"{method.upper()} {path}")
    for path, operations in SCHEMA["paths"].items()
    for method, operation in operations.items()
]


def _documented(operation: dict) -> set[str]:
    return set(operation["responses"]) & ERROR_CODES


def _operation_for(method: str, concrete_path: str) -> dict:
    """Find the operation a real path such as /users/9999 belongs to."""
    target = f"{API}{concrete_path.split('?')[0]}"
    matches = [
        operations[method.lower()]
        for template, operations in SCHEMA["paths"].items()
        if method.lower() in operations
        and re.fullmatch(re.sub(r"\{[^}]+\}", "[^/]+", template), target)
    ]
    # A literal path such as /users/me wins over /users/{user_id}.
    exact = SCHEMA["paths"].get(target, {}).get(method.lower())
    return exact or matches[0]


@pytest.mark.parametrize(("method", "path", "operation"), OPERATIONS)
def test_protected_operations_document_401(method: str, path: str, operation: dict) -> None:
    if operation.get("security"):
        assert "401" in _documented(operation)


@pytest.mark.parametrize(("method", "path", "operation"), OPERATIONS)
def test_operations_with_an_id_in_the_path_document_404(
    method: str, path: str, operation: dict
) -> None:
    if "{" in path:
        assert "404" in _documented(operation)


@pytest.mark.parametrize(("method", "path", "operation"), OPERATIONS)
def test_operations_with_input_document_422(method: str, path: str, operation: dict) -> None:
    if operation.get("parameters") or operation.get("requestBody"):
        assert "422" in _documented(operation)


@pytest.mark.parametrize(("method", "path", "operation"), OPERATIONS)
def test_error_responses_use_the_api_schemas_and_have_an_example(
    method: str, path: str, operation: dict
) -> None:
    for status_code in _documented(operation):
        response = operation["responses"][status_code]
        content = response["content"]["application/json"]

        assert response["description"]
        assert content["schema"]["$ref"] in ERROR_SCHEMAS
        assert content["example"]["code"]
        assert content["example"]["detail"]


@pytest.mark.parametrize(
    ("method", "path", "by_role"),
    [
        pytest.param(method, path, by_role, id=f"{method} {path}")
        for method, path, *by_role in MATRIX
    ],
)
def test_operations_that_refuse_a_role_document_403(method: str, path: str, by_role: list) -> None:
    operation = _operation_for(method, path)
    documented = _documented(operation)

    if 403 in by_role:
        assert "403" in documented
    if 401 in by_role:
        assert "401" in documented


def test_no_operation_uses_the_default_validation_schema() -> None:
    assert "HTTPValidationError" not in SCHEMA["components"]["schemas"]
    assert "HTTPValidationError" not in str(SCHEMA["paths"])


def test_each_status_code_is_described_the_same_everywhere() -> None:
    descriptions: dict[str, set[str]] = {}
    for operations in SCHEMA["paths"].values():
        for operation in operations.values():
            for status_code in _documented(operation):
                descriptions.setdefault(status_code, set()).add(
                    operation["responses"][status_code]["description"]
                )

    assert all(len(texts) == 1 for texts in descriptions.values()), descriptions


def test_public_reads_do_not_document_auth_errors() -> None:
    plans = SCHEMA["paths"][f"{API}/membership-plans"]["get"]

    assert _documented(plans) == {"422"}


def test_health_documents_no_errors() -> None:
    health = next(
        operations["get"]
        for path, operations in SCHEMA["paths"].items()
        if path.endswith("/health")
    )

    assert _documented(health) == set()


def test_docs_and_redoc_load(client) -> None:
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
