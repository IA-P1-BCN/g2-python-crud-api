from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import (
    Pagination,
    build_page,
    get_current_user,
    get_db,
    require_admin,
    require_staff,
)
from app.models.user import User
from app.schemas.booking import BookingRead
from app.schemas.common import Page
from app.schemas.membership import MembershipRead
from app.schemas.user import (
    PasswordChange,
    ProfileUpdate,
    UserCreate,
    UserFilters,
    UserRead,
    UserUpdate,
)
from app.services import access_service, booking_service, membership_service, user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "",
    response_model=Page[UserRead],
    summary="Listar usuarios",
    description=(
        "Lista usuarios paginados. Un entrenador solo ve socios; el administrador ve todos. "
        "Se puede filtrar por `role`, por `is_active`, por texto en el nombre o el email "
        "(`search`) y por fechas de alta (`created_from`, `created_to`) y de baja "
        "(`deactivated_from`, `deactivated_to`)."
    ),
)
def list_users(
    filters: Annotated[UserFilters, Query()],
    pagination: Pagination = Depends(),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
) -> Page[UserRead]:
    filters.role = access_service.visible_user_role(current_user, filters.role)
    items, total = user_service.list_users(
        db, page=pagination.page, size=pagination.size, filters=filters
    )
    return build_page(items, total, pagination)


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Crear usuario",
    description="Crea un usuario. Requiere rol administrador.",
)
def create_user(data: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    return user_service.create_user(db, data)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Obtener usuario",
    description="Devuelve un usuario por id. Solo el propio usuario o un administrador.",
)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    access_service.ensure_self_or_admin(current_user, user_id)
    return user_service.get_user(db, user_id)


@router.put(
    "/{user_id}/profile",
    response_model=UserRead,
    summary="Actualizar perfil propio",
    description="Actualiza el email y nombre del propio usuario.",
)
def update_profile(
    user_id: int,
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    access_service.ensure_self_or_admin(current_user, user_id)
    return user_service.update_profile(db, user_id, data)


@router.put(
    "/{user_id}/password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cambiar contraseña",
    description="Cambia la contraseña del propio usuario.",
)
def change_password(
    user_id: int,
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    access_service.ensure_self_or_admin(current_user, user_id)
    user_service.change_password(db, user_id, data)


@router.put(
    "/{user_id}",
    response_model=UserRead,
    summary="Actualizar usuario",
    description=(
        "Actualiza un usuario. Requiere rol administrador; no permite desactivarse a sí mismo."
    ),
)
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserRead:
    if data.is_active is False:
        access_service.ensure_not_own_account(current_user, user_id)
    return user_service.update_user(db, user_id, data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desactivar usuario",
    description=(
        "Da de baja a un usuario: la cuenta se desactiva, nunca se borra, para conservar "
        "su historial. Requiere rol administrador."
    ),
)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    access_service.ensure_not_own_account(current_user, user_id)
    user_service.deactivate_user(db, user_id)


@router.get(
    "/{user_id}/memberships",
    response_model=Page[MembershipRead],
    summary="Membresías de un usuario",
    description="Lista las membresías de un usuario. Solo el propio usuario o un administrador.",
)
def list_user_memberships(
    user_id: int,
    pagination: Pagination = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Page[MembershipRead]:
    access_service.ensure_self_or_admin(current_user, user_id)
    user_service.get_user(db, user_id)
    items, total = membership_service.list_memberships(
        db, page=pagination.page, size=pagination.size, user_id=user_id
    )
    return build_page(items, total, pagination)


@router.get(
    "/{user_id}/bookings",
    response_model=Page[BookingRead],
    summary="Reservas de un usuario",
    description="Lista las reservas de un usuario. Solo el propio usuario o un administrador.",
)
def list_user_bookings(
    user_id: int,
    pagination: Pagination = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Page[BookingRead]:
    access_service.ensure_self_or_admin(current_user, user_id)
    user_service.get_user(db, user_id)
    items, total = booking_service.list_bookings(
        db, page=pagination.page, size=pagination.size, member_id=user_id
    )
    return build_page(items, total, pagination)
