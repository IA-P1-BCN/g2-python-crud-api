from app import models  # noqa: F401  (registra los modelos en Base.metadata)
from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    """Crea todas las tablas en la base de datos configurada."""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
