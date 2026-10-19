from datetime import date, time

from pydantic import BaseModel

from app.schemas.membership import MembershipSummary


class CurrentMembership(MembershipSummary):
    days_left: int


class UpcomingBooking(BaseModel):
    booking_id: int
    booking_date: date
    schedule_id: int
    class_id: int
    class_name: str
    start_time: time
    end_time: time
    room_name: str | None
    trainer_name: str


class MemberStats(BaseModel):
    bookings_this_month: int
    total_bookings: int


class MemberDashboard(BaseModel):
    membership: CurrentMembership | None
    upcoming_bookings: list[UpcomingBooking]
    stats: MemberStats
