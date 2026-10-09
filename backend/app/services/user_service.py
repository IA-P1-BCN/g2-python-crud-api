from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import ColumnElement, func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError, NotFoundError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import PasswordChange, ProfileUpdate, UserCreate, UserFilters, UserUpdate


def list_users(
    db: Session,
    *,
    page: int,
    size: int,
    filters: UserFilters | None = None,
) -> tuple[list[User], int]:
    filters = filters or UserFilters()
    conditions = _user_conditions(filters)
    total = count_users(db, filters)
    stmt = select(User).where(*conditions).order_by(User.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def count_users(db: Session, filters: UserFilters) -> int:
    return db.execute(
        select(func.count()).select_from(User).where(*_user_conditions(filters))
    ).scalar_one()


def _user_conditions(filters: UserFilters) -> list[ColumnElement[bool]]:
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


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError(f"Usuario {user_id} no encontrado")
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def _ensure_email_is_free(db: Session, email: str, owner_id: int | None = None) -> None:
    """Raise a conflict if another user has the email; `owner_id` may keep their own."""
    existing = get_user_by_email(db, email)
    if existing is not None and existing.id != owner_id:
        raise ConflictError("El email ya está registrado")


def create_user(db: Session, data: UserCreate) -> User:
    _ensure_email_is_free(db, data.email)
    user = User(
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        hashed_password=hash_password(data.password),
    )
    _set_active(user, data.is_active)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    payload = data.model_dump(exclude_unset=True)
    password = payload.pop("password", None)

    if "email" in payload:
        _ensure_email_is_free(db, payload["email"], owner_id=user_id)

    is_active = payload.pop("is_active", None)
    for field, value in payload.items():
        setattr(user, field, value)
    if password:
        user.hashed_password = hash_password(password)
    if is_active is not None:
        _set_active(user, is_active)

    db.commit()
    db.refresh(user)
    return user


def update_profile(db: Session, user_id: int, data: ProfileUpdate) -> User:
    user = get_user(db, user_id)
    payload = data.model_dump(exclude_unset=True)

    if "email" in payload:
        _ensure_email_is_free(db, payload["email"], owner_id=user_id)

    for field, value in payload.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: int, data: PasswordChange) -> None:
    user = get_user(db, user_id)

    # Not a 401: the session is valid, and clients log the user out on any 401.
    if not verify_password(data.current_password, user.hashed_password):
        raise BusinessRuleError("La contraseña actual no es correcta")

    user.hashed_password = hash_password(data.new_password)
    db.commit()


def deactivate_user(db: Session, user_id: int) -> None:
    """Sign the user off without deleting them, so their history is kept."""
    user = get_user(db, user_id)
    _set_active(user, False)
    db.commit()


def _set_active(user: User, is_active: bool) -> None:
    """Keep is_active and deactivated_at in step; the first deactivation date is kept."""
    user.is_active = is_active
    if is_active:
        user.deactivated_at = None
    elif user.deactivated_at is None:
        user.deactivated_at = datetime.now(UTC)
