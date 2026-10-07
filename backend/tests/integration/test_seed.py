from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.seed import DEMO_PASSWORD, seed
from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User, UserRole


def _count(db: Session, model: type) -> int:
    return db.execute(select(func.count()).select_from(model)).scalar_one()


def test_seed_loads_demo_data(db_session: Session) -> None:
    seed(db_session)

    users = {user.email: user for user in db_session.execute(select(User)).scalars()}
    assert set(users) == {"admin@gymflow.dev", "trainer@gymflow.dev", "member@gymflow.dev"}
    assert users["admin@gymflow.dev"].role is UserRole.admin
    assert users["trainer@gymflow.dev"].role is UserRole.trainer
    assert users["member@gymflow.dev"].role is UserRole.member
    assert verify_password(DEMO_PASSWORD, users["admin@gymflow.dev"].hashed_password)

    assert _count(db_session, MembershipPlan) == 1
    assert _count(db_session, Room) == 1
    assert _count(db_session, GymClass) == 1
    assert _count(db_session, ClassSchedule) == 1
    assert _count(db_session, Booking) == 1
    assert _count(db_session, Payment) == 1

    membership = db_session.execute(select(Membership)).scalar_one()
    assert membership.status is MembershipStatus.active
    assert membership.user_id == users["member@gymflow.dev"].id

    booking = db_session.execute(select(Booking)).scalar_one()
    assert booking.status is BookingStatus.confirmed

    gym_class = db_session.execute(select(GymClass)).scalar_one()
    schedule = db_session.execute(select(ClassSchedule)).scalar_one()
    assert schedule.class_id == gym_class.id
    assert gym_class.trainer_id == users["trainer@gymflow.dev"].id


def test_seed_is_idempotent(db_session: Session) -> None:
    seed(db_session)
    seed(db_session)

    assert _count(db_session, User) == 3
    assert _count(db_session, MembershipPlan) == 1
    assert _count(db_session, GymClass) == 1
    assert _count(db_session, Booking) == 1
