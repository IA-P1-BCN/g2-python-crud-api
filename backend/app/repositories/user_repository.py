"""Data access for users. No business rules here: it returns rows or None, the services decide."""

from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import ColumnElement, Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserFilters


def get(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def list_page(db: Session, filters: UserFilters, *, page: int, size: int) -> list[User]:
    stmt = _filtered(filters).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all())


def list_all(db: Session, filters: UserFilters) -> list[User]:
    return list(db.execute(_filtered(filters)).scalars().all())


def count(db: Session, filters: UserFilters) -> int:
    return db.execute(
        select(func.count()).select_from(User).where(*_conditions(filters))
    ).scalar_one()


def add(db: Session, user: User) -> User:
    db.add(user)
    return save(db, user)


def save(db: Session, user: User) -> User:
    """Write the pending changes of the user and return it with the stored values."""
    db.commit()
    db.refresh(user)
    return user


def _filtered(filters: UserFilters) -> Select[tuple[User]]:
    return select(User).where(*_conditions(filters)).order_by(User.id)


def _conditions(filters: UserFilters) -> list[ColumnElement[bool]]:
    conditions: list[ColumnElement[bool]] = []
    if filters.role is not None:
        conditions.append(User.role == filters.role)
    if filters.is_active is not None:
        conditions.append(User.is_active.is_(filters.is_active))
    if filters.search:
        pattern = f"%{filters.search.strip()}%"
        conditions.append(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))
    conditions += _date_range(User.created_at, filters.created_from, filters.created_to)
    conditions += _date_range(User.deactivated_at, filters.deactivated_from, filters.deactivated_to)
    return conditions


def _date_range(column, start: date | None, end: date | None) -> list[ColumnElement[bool]]:
    """Conditions for a timestamp column falling between two calendar days, both included."""
    conditions: list[ColumnElement[bool]] = []
    if start is not None:
        conditions.append(column >= datetime.combine(start, time.min, tzinfo=UTC))
    if end is not None:
        conditions.append(column < datetime.combine(end + timedelta(days=1), time.min, tzinfo=UTC))
    return conditions
