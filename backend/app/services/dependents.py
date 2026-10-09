"""Shared deletion rule: a record that other records depend on is not deleted."""

from sqlalchemy import select
from sqlalchemy.orm import InstrumentedAttribute, Session

from app.core.exceptions import ConflictError


def ensure_no_dependents(
    db: Session, foreign_key: InstrumentedAttribute[int], owner_id: int, message: str
) -> None:
    """Raise a conflict with `message` if any row points to `owner_id` through `foreign_key`."""
    dependent = db.execute(select(foreign_key).where(foreign_key == owner_id).limit(1)).first()
    if dependent is not None:
        raise ConflictError(message)
