import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/auth'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { LandingPage } from '@/pages/public/LandingPage'
import { PublicPlansPage } from '@/pages/public/PublicPlansPage'
import { MemberHomePage } from '@/pages/member/MemberHomePage'
import { ClassesPage } from '@/pages/member/ClassesPage'
import { SessionDetailPage } from '@/pages/member/SessionDetailPage'
import { BookingsPage } from '@/pages/member/BookingsPage'
import { MembershipPage } from '@/pages/member/MembershipPage'
import { ProfilePage } from '@/pages/member/ProfilePage'
import { TrainerHomePage } from '@/pages/trainer/TrainerHomePage'
import { TrainerSessionsPage } from '@/pages/trainer/TrainerSessionsPage'
import { TrainerMembersPage } from '@/pages/trainer/TrainerMembersPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { PlansPage } from '@/pages/admin/PlansPage'
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminMembershipsPage } from '@/pages/admin/AdminMembershipsPage'
import { AdminRoomsPage } from '@/pages/admin/AdminRoomsPage'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'
import { AdminClassesPage } from '@/pages/admin/AdminClassesPage'
import { AdminSchedulesPage } from '@/pages/admin/AdminSchedulesPage'
import { SandboxPage } from './sandbox/SandboxPage'

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="plans" element={<PublicPlansPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/sandbox" element={<SandboxPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="member" element={<ProtectedRoute allowedRoles={['member']} />}>
            <Route index element={<MemberHomePage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="sessions/:scheduleId" element={<SessionDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="trainer" element={<ProtectedRoute allowedRoles={['trainer']} />}>
            <Route index element={<TrainerHomePage />} />
            <Route path="sessions" element={<TrainerSessionsPage />} />
            <Route path="members" element={<TrainerMembersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="memberships" element={<AdminMembershipsPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="classes" element={<AdminClassesPage />} />
            <Route path="schedules" element={<AdminSchedulesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
