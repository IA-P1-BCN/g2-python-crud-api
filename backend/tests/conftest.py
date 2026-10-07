from collections.abc import Generator
from datetime import date, time, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.room import Room
from app.models.user import User, UserRole

# Los tests usan su propia base de datos; no intentamos crear tablas en PostgreSQL.
settings.auto_create_tables = False
# Tests log only to the console, not to logs/app.log.
settings.log_file = ""
# HS256 needs a key of at least 32 bytes; the default "change-me" is only a placeholder.
settings.secret_key = "test-secret-key-0123456789-abcdefghij"


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    db = testing_session()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def anon_client(db_session: Session) -> Generator[TestClient, None, None]:
    """Client without a session: requests carry only the headers each test sends."""

    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def client(anon_client: TestClient) -> TestClient:
    """Client that acts as an admin, so resource tests can focus on the resource rules."""
    app.dependency_overrides[get_current_user] = lambda: User(
        id=0, email="root@test.dev", full_name="Root", role=UserRole.admin, is_active=True
    )
    return anon_client


def _make_user(db: Session, email: str, role: UserRole) -> User:
    user = User(
        email=email,
        full_name=f"{role.value.title()} Test",
        role=role,
        hashed_password=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def admin(db_session: Session) -> User:
    return _make_user(db_session, "admin@test.dev", UserRole.admin)


@pytest.fixture()
def trainer(db_session: Session) -> User:
    return _make_user(db_session, "trainer@test.dev", UserRole.trainer)


@pytest.fixture()
def member(db_session: Session) -> User:
    return _make_user(db_session, "member@test.dev", UserRole.member)


@pytest.fixture()
def plan(db_session: Session) -> MembershipPlan:
    plan = MembershipPlan(name="Mensual", description="30 días", price_cents=3999, duration_days=30)
    db_session.add(plan)
    db_session.commit()
    db_session.refresh(plan)
    return plan


@pytest.fixture()
def room(db_session: Session) -> Room:
    room = Room(name="Sala 1", capacity=20)
    db_session.add(room)
    db_session.commit()
    db_session.refresh(room)
    return room


@pytest.fixture()
def gym_class(db_session: Session, trainer: User, room: Room) -> GymClass:
    gym_class = GymClass(name="Yoga", capacity=2, trainer_id=trainer.id, room_id=room.id)
    db_session.add(gym_class)
    db_session.commit()
    db_session.refresh(gym_class)
    return gym_class


@pytest.fixture()
def schedule(db_session: Session, gym_class: GymClass, room: Room) -> ClassSchedule:
    schedule = ClassSchedule(
        class_id=gym_class.id,
        day_of_week=0,
        start_time=time(10, 0),
        end_time=time(11, 0),
        room_id=room.id,
    )
    db_session.add(schedule)
    db_session.commit()
    db_session.refresh(schedule)
    return schedule


@pytest.fixture()
def active_membership(db_session: Session, member: User, plan: MembershipPlan) -> Membership:
    today = date.today()
    membership = Membership(
        user_id=member.id,
        plan_id=plan.id,
        start_date=today,
        end_date=today + timedelta(days=plan.duration_days),
        status=MembershipStatus.active,
    )
    db_session.add(membership)
    db_session.commit()
    db_session.refresh(membership)
    return membership
