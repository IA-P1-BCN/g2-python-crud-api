from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app import models  # noqa: F401  (registra los modelos en Base.metadata)
from app.db.base import Base

BACKEND_DIR = Path(__file__).resolve().parents[2]


def test_initial_migration_creates_every_table(tmp_path: Path) -> None:
    db_path = tmp_path / "migration.db"

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.set_main_option("sqlalchemy.url", f"sqlite+pysqlite:///{db_path}")

    command.upgrade(config, "head")

    engine = create_engine(f"sqlite+pysqlite:///{db_path}")
    try:
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()

    assert set(Base.metadata.tables.keys()) <= tables
    assert "alembic_version" in tables


def test_migration_can_be_reverted(tmp_path: Path) -> None:
    db_path = tmp_path / "migration_revert.db"

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.set_main_option("sqlalchemy.url", f"sqlite+pysqlite:///{db_path}")

    command.upgrade(config, "head")
    command.downgrade(config, "base")

    engine = create_engine(f"sqlite+pysqlite:///{db_path}")
    try:
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()

    assert tables <= {"alembic_version"}
