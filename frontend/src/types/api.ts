import type { components } from './schema'

type Schemas = components['schemas']

export type Role = Schemas['UserRole']
export type User = Schemas['UserRead']
export type UserCreate = Schemas['UserCreate']
export type UserUpdate = Schemas['UserUpdate']
export type UserPage = Schemas['Page_UserRead_']

export type MembershipPlan = Schemas['MembershipPlanRead']
export type MembershipPlanCreate = Schemas['MembershipPlanCreate']
export type MembershipPlanUpdate = Schemas['MembershipPlanUpdate']
export type MembershipPlanPage = Schemas['Page_MembershipPlanRead_']

export type GymClass = Schemas['GymClassRead']
export type GymClassPage = Schemas['Page_GymClassRead_']

export type Room = Schemas['RoomRead']
export type RoomPage = Schemas['Page_RoomRead_']

export type ClassSchedule = Schemas['ClassScheduleRead']
export type ClassSchedulePage = Schemas['Page_ClassScheduleRead_']

export type Membership = Schemas['MembershipRead']
export type MembershipStatus = Schemas['MembershipStatus']
export type MembershipPage = Schemas['Page_MembershipRead_']

export type Booking = Schemas['BookingRead']
export type BookingCreate = Schemas['BookingCreate']
export type BookingStatus = Schemas['BookingStatus']
export type BookingPage = Schemas['Page_BookingRead_']

export type Payment = Schemas['PaymentRead']
export type PaymentCreate = Schemas['PaymentCreate']
export type PaymentStatus = Schemas['PaymentStatus']
export type PaymentPage = Schemas['Page_PaymentRead_']

export type LoginRequest = Schemas['LoginRequest']
export type RegisterRequest = Schemas['RegisterRequest']
export type Token = Schemas['Token']

export type DashboardPeriod = Schemas['PeriodRange']['key']
export type DashboardSummary = Schemas['DashboardSummary']
export type WeeklyMovement = Schemas['WeeklyMovement']
export type DailyBookings = Schemas['DailyBookings']
export type ClassOccupancy = Schemas['ClassOccupancy']
export type ExpiringMembership = Schemas['ExpiringMembership']
export type PlanShare = Schemas['PlanShare']
export type PopularClass = Schemas['PopularClass']
