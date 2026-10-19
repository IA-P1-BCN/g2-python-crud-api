from datetime import datetime, time
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.gym_class import GymClass
    from app.models.room import Room


class ClassSchedule(Base):
    __tablename__ = "class_schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("gym_classes.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    room_id: Mapped[int | None] = mapped_column(ForeignKey("rooms.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    gym_class: Mapped["GymClass"] = relationship("GymClass", back_populates="schedules")
    room: Mapped["Room | None"] = relationship("Room")
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="schedule", cascade="all, delete-orphan"
    )
