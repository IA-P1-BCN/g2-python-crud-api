from fastapi import APIRouter

from app.api.v1 import (
    admin,
    auth,
    bookings,
    class_schedules,
    classes,
    export,
    membership_plans,
    memberships,
    payments,
    rooms,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(membership_plans.router)
api_router.include_router(memberships.router)
api_router.include_router(rooms.router)
api_router.include_router(classes.router)
api_router.include_router(class_schedules.router)
api_router.include_router(bookings.router)
api_router.include_router(payments.router)
api_router.include_router(export.router)
api_router.include_router(admin.router)
