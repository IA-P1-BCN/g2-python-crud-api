"""Figures of the admin dashboard, all read-only."""

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.class_schedule import ClassSchedule
from app.models.gym_class import GymClass
from app.models.membership import Membership, MembershipStatus
from app.models.membership_plan import MembershipPlan
from app.models.user import User, UserRole
from app.schemas.dashboard import (
    BookingStats,
    ClassOccupancy,
    DailyBookings,
    DashboardPeriod,
    DashboardSummary,
    ExpiringMembership,
    MemberStats,
    OccupancyStats,
    PeriodRange,
    PlanShare,
    PlanStats,
    PopularClass,
    WeeklyMovement,
)
from app.schemas.user import UserFilters
from app.services import user_service

PERIOD_DAYS: dict[DashboardPeriod, int] = {"today": 1, "7d": 7, "30d": 30}
WEEKS_OF_HISTORY = 4
EXPIRY_WINDOW_DAYS = 7
POPULAR_CLASSES_LIMIT = 5
DAYS_PER_MONTH = 30


def get_summary(
    db: Session, period: DashboardPeriod, today: date | None = None
) -> DashboardSummary:
    today = today or date.today()
    start = today - timedelta(days=PERIOD_DAYS[period] - 1)
    return DashboardSummary(
        period=PeriodRange(key=period, start=start, end=today),
        members=_member_stats(db, start, today),
        weekly_movements=_weekly_movements(db, today),
        bookings=_booking_stats(db, start, today),
        occupancy=_occupancy(db, start, today),
        expiring_memberships=_expiring_memberships(db, today),
        plans=_plan_stats(db, today),
        popular_classes=_popular_classes(db, start, today),
    )


def _days(start: date, end: date) -> list[date]:
    return [start + timedelta(days=offset) for offset in range((end - start).days + 1)]


def _count_members(db: Session, **filters) -> int:
    return user_service.count_users(db, UserFilters(role=UserRole.member, **filters))


def _member_stats(db: Session, start: date, end: date) -> MemberStats:
    return MemberStats(
        active=_count_members(db, is_active=True),
        signups=_count_members(db, created_from=start, created_to=end),
        sign_offs=_count_members(db, deactivated_from=start, deactivated_to=end),
    )


def _weekly_movements(db: Session, today: date) -> list[WeeklyMovement]:
    """The last weeks, oldest first; the last one ends today."""
    weeks = []
    for weeks_back in range(WEEKS_OF_HISTORY - 1, -1, -1):
        end = today - timedelta(days=7 * weeks_back)
        start = end - timedelta(days=6)
        weeks.append(
            WeeklyMovement(
                start=start,
                end=end,
                signups=_count_members(db, created_from=start, created_to=end),
                sign_offs=_count_members(db, deactivated_from=start, deactivated_to=end),
            )
        )
    return weeks


def _confirmed_in(start: date, end: date) -> tuple:
    return (
        Booking.status == BookingStatus.confirmed,
        Booking.booking_date >= start,
        Booking.booking_date <= end,
    )


def _booking_stats(db: Session, start: date, end: date) -> BookingStats:
    rows = db.execute(
        select(Booking.booking_date, func.count())
        .where(*_confirmed_in(start, end))
        .group_by(Booking.booking_date)
    ).all()
    per_day = dict(rows)
    by_day = [DailyBookings(day=day, count=per_day.get(day, 0)) for day in _days(start, end)]
    return BookingStats(total=sum(item.count for item in by_day), by_day=by_day)


def _bookings_per_class(db: Session, start: date, end: date) -> dict[int, int]:
    rows = db.execute(
        select(ClassSchedule.class_id, func.count())
        .join(Booking, Booking.schedule_id == ClassSchedule.id)
        .where(*_confirmed_in(start, end))
        .group_by(ClassSchedule.class_id)
    ).all()
    return dict(rows)


def _rate(part: int, whole: int) -> float:
    return round(part / whole, 4) if whole else 0.0


def _occupancy(db: Session, start: date, end: date) -> OccupancyStats:
    """Booked spots against offered spots: class capacity times its sessions in the period."""
    weekdays = [day.weekday() for day in _days(start, end)]
    booked_per_class = _bookings_per_class(db, start, end)
    classes = db.execute(select(GymClass).where(GymClass.is_active.is_(True))).scalars().all()

    by_class = []
    for gym_class in classes:
        sessions = sum(weekdays.count(schedule.day_of_week) for schedule in gym_class.schedules)
        if not sessions:
            continue
        booked = booked_per_class.get(gym_class.id, 0)
        capacity = gym_class.capacity * sessions
        by_class.append(
            ClassOccupancy(
                class_id=gym_class.id,
                name=gym_class.name,
                booked=booked,
                capacity=capacity,
                rate=_rate(booked, capacity),
            )
        )
    by_class.sort(key=lambda item: item.rate, reverse=True)
    return OccupancyStats(
        average_rate=_rate(
            sum(item.booked for item in by_class), sum(item.capacity for item in by_class)
        ),
        by_class=by_class,
    )


def _in_force(today: date) -> tuple:
    return (
        Membership.status != MembershipStatus.cancelled,
        Membership.start_date <= today,
        Membership.end_date >= today,
    )


def _expiring_memberships(db: Session, today: date) -> list[ExpiringMembership]:
    rows = db.execute(
        select(Membership, User.full_name, MembershipPlan.name)
        .join(User, Membership.user_id == User.id)
        .join(MembershipPlan, Membership.plan_id == MembershipPlan.id)
        .where(*_in_force(today), Membership.end_date <= today + timedelta(EXPIRY_WINDOW_DAYS))
        .order_by(Membership.end_date, Membership.id)
    ).all()
    return [
        ExpiringMembership(
            membership_id=membership.id,
            user_id=membership.user_id,
            full_name=full_name,
            plan_name=plan_name,
            end_date=membership.end_date,
            days_left=(membership.end_date - today).days,
        )
        for membership, full_name, plan_name in rows
    ]


def _plan_stats(db: Session, today: date) -> PlanStats:
    rows = db.execute(
        select(MembershipPlan, func.count(Membership.id))
        .join(Membership, Membership.plan_id == MembershipPlan.id)
        .where(*_in_force(today))
        .group_by(MembershipPlan.id)
        .order_by(func.count(Membership.id).desc(), MembershipPlan.id)
    ).all()
    total = sum(members for _, members in rows)
    return PlanStats(
        active_memberships=total,
        # Each plan's price spread over its duration, to compare plans of different lengths
        monthly_recurring_cents=round(
            sum(
                members * plan.price_cents * DAYS_PER_MONTH / plan.duration_days
                for plan, members in rows
            )
        ),
        by_plan=[
            PlanShare(
                plan_id=plan.id,
                name=plan.name,
                price_cents=plan.price_cents,
                members=members,
                share=_rate(members, total),
            )
            for plan, members in rows
        ],
    )


def _popular_classes(db: Session, start: date, end: date) -> list[PopularClass]:
    booked_per_class = _bookings_per_class(db, start, end)
    if not booked_per_class:
        return []
    names = dict(
        db.execute(
            select(GymClass.id, GymClass.name).where(GymClass.id.in_(booked_per_class))
        ).all()
    )
    ranking = sorted(booked_per_class.items(), key=lambda item: (-item[1], item[0]))
    return [
        PopularClass(class_id=class_id, name=names[class_id], bookings=bookings)
        for class_id, bookings in ranking[:POPULAR_CLASSES_LIMIT]
    ]
