import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, homePathForRole, useAuth } from '@/auth'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ClassesPage } from '@/pages/member/ClassesPage'
import { BookingsPage } from '@/pages/member/BookingsPage'
import { MembershipPage } from '@/pages/member/MembershipPage'
import { TrainerSessionsPage } from '@/pages/trainer/TrainerSessionsPage'
import { TrainerMembersPage } from '@/pages/trainer/TrainerMembersPage'
import { PlansPage } from '@/pages/admin/PlansPage'
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homePathForRole(user.role)} replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          <Route path="member" element={<ProtectedRoute allowedRoles={['member']} />}>
            <Route index element={<Navigate to="/member/classes" replace />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="membership" element={<MembershipPage />} />
          </Route>

          <Route path="trainer" element={<ProtectedRoute allowedRoles={['trainer']} />}>
            <Route index element={<Navigate to="/trainer/sessions" replace />} />
            <Route path="sessions" element={<TrainerSessionsPage />} />
            <Route path="members" element={<TrainerMembersPage />} />
          </Route>

          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Navigate to="/admin/plans" replace />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="members" element={<AdminMembersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
