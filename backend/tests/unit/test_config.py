"""Database URL handed out by the hosting platform (specs/113-deploy-to-render.md)."""

import pytest

from app.core.config import Settings


@pytest.mark.parametrize(
    "given",
    ["postgresql://user:pass@host:5432/db", "postgres://user:pass@host:5432/db"],
)
def test_platform_urls_get_the_psycopg_driver(given: str) -> None:
    settings = Settings(_env_file=None, database_url=given)

    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/db"


@pytest.mark.parametrize(
    "given",
    [
        "postgresql+psycopg://user:pass@host:5432/db",
        "sqlite:///./test.db",
    ],
)
def test_other_urls_are_left_as_they_are(given: str) -> None:
    assert Settings(_env_file=None, database_url=given).database_url == given
