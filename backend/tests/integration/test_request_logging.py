import logging

import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_each_request_is_logged(client: TestClient, caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.INFO, logger="app.requests"):
        client.get("/health")

    messages = [r.getMessage() for r in caplog.records if r.name == "app.requests"]
    assert len(messages) == 1
    assert messages[0].startswith("GET /health 200 ")


def test_app_start_and_stop_are_logged(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.INFO, logger="app.main"), TestClient(app):
        pass

    messages = [r.getMessage() for r in caplog.records if r.name == "app.main"]
    assert any("Athletica API started" in m for m in messages)
    assert any("Athletica API stopped" in m for m in messages)
