from datetime import date, time, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.payment import Payment, PaymentStatus
from app.models.room import Room
from app.models.user import User, UserRole

DEMO_PASSWORD = "gymflow123"


def seed(db: Session) -> None:
    """Carga datos de ejemplo. No hace nada si ya hay usuarios."""
    if db.execute(select(User)).first() is not None:
        return

    admin = User(
        email="admin@gymflow.dev",
        full_name="Admin Demo",
        role=UserRole.admin,
        hashed_password=hash_password(DEMO_PASSWORD),
    )
    trainer = User(
        email="trainer@gymflow.dev",
        full_name="Entrenador Demo",
        role=UserRole.trainer,
        hashed_password=hash_password(DEMO_PASSWORD),
    )
    member = User(
        email="member@gymflow.dev",
        full_name="Socio Demo",
        role=UserRole.member,
        hashed_password=hash_password(DEMO_PASSWORD),
    )
    db.add_all([admin, trainer, member])
    db.flush()

    plan = MembershipPlan(
        name="Mensual",
        description="Acceso completo durante 30 días",
        price_cents=3999,
        duration_days=30,
        is_active=True,
    )
    room = Room(name="Sala 1", capacity=20)
    db.add_all([plan, room])
    db.flush()

    gym_class = GymClass(
        name="Yoga",
        capacity=15,
        trainer_id=trainer.id,
        room_id=room.id,
        is_active=True,
    )
    db.add(gym_class)
    db.flush()

    schedule = ClassSchedule(
        class_id=gym_class.id,
        day_of_week=0,
        start_time=time(10, 0),
        end_time=time(11, 0),
        room_id=room.id,
    )
    db.add(schedule)
    db.flush()

    today = date.today()
    membership = Membership(
        user_id=member.id,
        plan_id=plan.id,
        start_date=today,
        end_date=today + timedelta(days=plan.duration_days),
        status=MembershipStatus.active,
    )
    db.add(membership)
    db.flush()

    db.add(
        Booking(
            member_id=member.id,
            schedule_id=schedule.id,
            booking_date=today,
            status=BookingStatus.confirmed,
        )
    )
    db.add(
        Payment(
            user_id=member.id,
            membership_id=membership.id,
            amount_cents=plan.price_cents,
            status=PaymentStatus.paid,
        )
    )
    db.commit()


def main() -> None:
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
