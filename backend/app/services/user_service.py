from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


def list_users(
    db: Session,
    *,
    page: int,
    size: int,
    role: UserRole | None = None,
) -> tuple[list[User], int]:
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
        count_stmt = count_stmt.where(User.role == role)
    total = db.execute(count_stmt).scalar_one()
    stmt = stmt.order_by(User.id).offset((page - 1) * size).limit(size)
    return list(db.execute(stmt).scalars().all()), total


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError(f"Usuario {user_id} no encontrado")
    return user


def create_user(db: Session, data: UserCreate) -> User:
    existing = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if existing is not None:
        raise ConflictError("El email ya está registrado")
    user = User(
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        is_active=data.is_active,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    payload = data.model_dump(exclude_unset=True)
    password = payload.pop("password", None)

    if "email" in payload:
        duplicate = db.execute(
            select(User).where(User.email == payload["email"], User.id != user_id)
        ).scalar_one_or_none()
        if duplicate is not None:
            raise ConflictError("El email ya está registrado")

    for field, value in payload.items():
        setattr(user, field, value)
    if password:
        user.hashed_password = hash_password(password)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    db.delete(user)
    db.commit()
