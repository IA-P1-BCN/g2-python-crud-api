import pytest

from app.core.exceptions import ConflictError
from app.models.gym_class import GymClass
from app.services.dependents import ensure_no_dependents


def test_passes_when_nothing_points_to_the_owner(db_session, room) -> None:
    ensure_no_dependents(db_session, GymClass.room_id, room.id, "En uso")


def test_raises_a_conflict_with_the_message_when_something_does(
    db_session, room, gym_class
) -> None:
    with pytest.raises(ConflictError, match="En uso"):
        ensure_no_dependents(db_session, GymClass.room_id, room.id, "En uso")
