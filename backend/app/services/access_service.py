"""Ownership rules: what a user may do with a resource, beyond the role guard of the route."""

from app.core.exceptions import PermissionDeniedError
from app.models.booking import Booking
from app.models.gym_class import GymClass
from app.models.user import User, UserRole


def _is_admin(user: User) -> bool:
    return user.role == UserRole.admin


def _deny() -> None:
    raise PermissionDeniedError("No tienes permiso para acceder a este recurso")


def ensure_self_or_admin(current_user: User, user_id: int) -> None:
    """Members and trainers reach only their own data; admins reach anyone's."""
    if not _is_admin(current_user) and current_user.id != user_id:
        _deny()


def ensure_can_manage_class(current_user: User, gym_class: GymClass) -> None:
    """A trainer manages only the classes they teach."""
    if not _is_admin(current_user) and gym_class.trainer_id != current_user.id:
        _deny()


def ensure_can_assign_trainer(current_user: User, trainer_id: int | None) -> None:
    """A trainer cannot put a class in another trainer's name."""
    if trainer_id is not None and not _is_admin(current_user) and trainer_id != current_user.id:
        _deny()


def ensure_can_read_booking(current_user: User, booking: Booking) -> None:
    """A booking is visible to its member, to the trainer of its class and to admins."""
    if _is_admin(current_user) or booking.member_id == current_user.id:
        return
    if booking.schedule.gym_class.trainer_id != current_user.id:
        _deny()


def visible_user_role(current_user: User, requested: UserRole | None) -> UserRole | None:
    """Role filter for user listings: trainers can list members only."""
    if _is_admin(current_user):
        return requested
    if requested not in (None, UserRole.member):
        _deny()
    return UserRole.member


def bookings_trainer_scope(current_user: User) -> int | None:
    """Trainer id that limits a bookings listing, or None when everything is visible."""
    return None if _is_admin(current_user) else current_user.id
