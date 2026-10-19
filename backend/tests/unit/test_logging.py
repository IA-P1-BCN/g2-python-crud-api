import logging
from collections.abc import Generator
from logging.handlers import RotatingFileHandler
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.logging import configure_logging, register_request_logging


@pytest.fixture(autouse=True)
def reset_logging() -> Generator[None, None, None]:
    yield
    # Close the log file so pytest can delete tmp_path (Windows keeps it locked).
    configure_logging("INFO")


def _app_handlers() -> list[logging.Handler]:
    return [h for h in logging.getLogger().handlers if type(h).__module__.startswith("logging")]


def test_logs_to_rotating_file(tmp_path: Path) -> None:
    log_file = tmp_path / "logs" / "app.log"

    configure_logging("INFO", str(log_file))
    logging.getLogger("app.test").info("test message")

    assert any(isinstance(h, RotatingFileHandler) for h in logging.getLogger().handlers)
    for handler in logging.getLogger().handlers:
        handler.flush()
    content = log_file.read_text(encoding="utf-8")
    assert "INFO" in content
    assert "app.test" in content
    assert "test message" in content


def test_without_file_logs_only_to_console() -> None:
    configure_logging("INFO")

    handlers = logging.getLogger().handlers
    assert not any(isinstance(h, RotatingFileHandler) for h in handlers)
    assert any(type(h) is logging.StreamHandler for h in handlers)


def test_reconfiguring_does_not_duplicate_handlers(tmp_path: Path) -> None:
    configure_logging("INFO", str(tmp_path / "app.log"))
    first = len(_app_handlers())

    configure_logging("INFO", str(tmp_path / "app.log"))

    assert len(_app_handlers()) == first


def test_sets_level_from_settings() -> None:
    configure_logging("WARNING")
    assert logging.getLogger().level == logging.WARNING

    configure_logging("not-a-level")
    assert logging.getLogger().level == logging.INFO


def _app_with_request_logging() -> FastAPI:
    app = FastAPI()
    register_request_logging(app)

    @app.get("/ok")
    def ok() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("boom")

    return app


@pytest.mark.parametrize(
    ("path", "status", "level"),
    [
        ("/ok", 200, logging.INFO),
        ("/missing", 404, logging.WARNING),
        ("/boom", 500, logging.ERROR),
    ],
)
def test_request_logging_level_by_status(
    caplog: pytest.LogCaptureFixture, path: str, status: int, level: int
) -> None:
    client = TestClient(_app_with_request_logging(), raise_server_exceptions=False)

    with caplog.at_level(logging.INFO, logger="app.requests"):
        response = client.get(path)

    assert response.status_code == status
    [record] = [r for r in caplog.records if r.name == "app.requests"]
    assert record.levelno == level
    assert record.getMessage().startswith(f"GET {path} {status} ")
    assert record.getMessage().endswith("ms")
