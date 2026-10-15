from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError, NotFoundError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories import user_repository
from app.schemas.user import (
    PasswordChange,
    ProfileUpdate,
    UserAudit,
    UserCreate,
    UserFilters,
    UserRef,
    UserUpdate,
)


def list_users(
    db: Session,
    *,
    page: int,
    size: int,
    filters: UserFilters | None = None,
) -> tuple[list[User], int]:
    filters = filters or UserFilters()
    total = user_repository.count(db, filters)
    return user_repository.list_page(db, filters, page=page, size=size), total


def count_users(db: Session, filters: UserFilters) -> int:
    return user_repository.count(db, filters)


def get_user(db: Session, user_id: int) -> User:
    user = user_repository.get(db, user_id)
    if user is None:
        raise NotFoundError(f"Usuario {user_id} no encontrado")
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return user_repository.get_by_email(db, email)


def _ensure_email_is_free(db: Session, email: str, owner_id: int | None = None) -> None:
    """Raise a conflict if another user has the email; `owner_id` may keep their own."""
    existing = get_user_by_email(db, email)
    if existing is not None and existing.id != owner_id:
        raise ConflictError("El email ya está registrado")


def create_user(db: Session, data: UserCreate, created_by: User | None) -> User:
    """Create a user. `created_by` is who creates it; None means the user signs themselves up."""
    _ensure_email_is_free(db, data.email)
    user = User(
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        hashed_password=hash_password(data.password),
        created_by_id=created_by.id if created_by else None,
    )
    _set_active(user, data.is_active)
    user = user_repository.add(db, user)
    if created_by is None:
        # The id only exists once the row is stored.
        user.created_by_id = user.id
        user = user_repository.save(db, user)
    return user


def get_audit(db: Session, user_id: int) -> UserAudit:
    """Who created and last changed the user, and when."""
    user = get_user(db, user_id)
    return UserAudit(
        user_id=user.id,
        created_at=user.created_at,
        created_by=_person(db, user.created_by_id),
        updated_at=user.updated_at,
        updated_by=_person(db, user.updated_by_id),
    )


def _person(db: Session, user_id: int | None) -> UserRef | None:
    user = user_repository.get(db, user_id) if user_id is not None else None
    return UserRef.model_validate(user) if user is not None else None


def _touch(user: User, changed_by: User) -> None:
    """Record who made the last change and when."""
    user.updated_by_id = changed_by.id
    user.updated_at = datetime.now(UTC)


def update_user(db: Session, user_id: int, data: UserUpdate, changed_by: User) -> User:
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

    _touch(user, changed_by)
    return user_repository.save(db, user)


def update_profile(db: Session, user_id: int, data: ProfileUpdate, changed_by: User) -> User:
    user = get_user(db, user_id)
    payload = data.model_dump(exclude_unset=True)

    if "email" in payload:
        _ensure_email_is_free(db, payload["email"], owner_id=user_id)

    for field, value in payload.items():
        setattr(user, field, value)

    _touch(user, changed_by)
    return user_repository.save(db, user)


def change_password(db: Session, user_id: int, data: PasswordChange, changed_by: User) -> None:
    user = get_user(db, user_id)

    # Not a 401: the session is valid, and clients log the user out on any 401.
    if not verify_password(data.current_password, user.hashed_password):
        raise BusinessRuleError("La contraseña actual no es correcta")

    user.hashed_password = hash_password(data.new_password)
    _touch(user, changed_by)
    user_repository.save(db, user)


def reset_password(db: Session, user: User, new_password: str) -> None:
    """Set a new password without the current one (recovery link); the user made the change."""
    user.hashed_password = hash_password(new_password)
    _touch(user, user)
    user_repository.save(db, user)


def mark_email_verified(db: Session, user: User) -> None:
    """Record the first time the user confirmed their email."""
    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(UTC)
        user_repository.save(db, user)


def deactivate_user(db: Session, user_id: int, changed_by: User) -> None:
    """Sign the user off without deleting them, so their history is kept."""
    user = get_user(db, user_id)
    _set_active(user, False)
    _touch(user, changed_by)
    user_repository.save(db, user)


def _set_active(user: User, is_active: bool) -> None:
    """Keep is_active and deactivated_at in step; the first deactivation date is kept."""
    user.is_active = is_active
    if is_active:
        user.deactivated_at = None
    elif user.deactivated_at is None:
        user.deactivated_at = datetime.now(UTC)
