from datetime import date
from typing import Literal

from pydantic import BaseModel

DashboardPeriod = Literal["today", "7d", "30d"]


class PeriodRange(BaseModel):
    key: DashboardPeriod
    start: date
    end: date


class MemberStats(BaseModel):
    active: int
    signups: int
    sign_offs: int


class WeeklyMovement(BaseModel):
    """Signups and sign-offs of one week (seven days, both ends included)."""

    start: date
    end: date
    signups: int
    sign_offs: int


class DailyBookings(BaseModel):
    day: date
    count: int


class BookingStats(BaseModel):
    total: int
    by_day: list[DailyBookings]


class ClassOccupancy(BaseModel):
    class_id: int
    name: str
    booked: int
    capacity: int
    rate: float


class OccupancyStats(BaseModel):
    average_rate: float
    by_class: list[ClassOccupancy]


class ExpiringMembership(BaseModel):
    membership_id: int
    user_id: int
    full_name: str
    plan_name: str
    end_date: date
    days_left: int


class PlanShare(BaseModel):
    plan_id: int
    name: str
    price_cents: int
    members: int
    share: float


class PlanStats(BaseModel):
    active_memberships: int
    monthly_recurring_cents: int
    by_plan: list[PlanShare]


class PopularClass(BaseModel):
    class_id: int
    name: str
    bookings: int


class DashboardSummary(BaseModel):
    period: PeriodRange
    members: MemberStats
    weekly_movements: list[WeeklyMovement]
    bookings: BookingStats
    occupancy: OccupancyStats
    expiring_memberships: list[ExpiringMembership]
    plans: PlanStats
    popular_classes: list[PopularClass]
