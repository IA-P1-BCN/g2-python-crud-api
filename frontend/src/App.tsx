import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/auth'
import { AppLayout } from '@/layouts/AppLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { HomePage } from '@/pages/public/HomePage'
import { PublicPlansPage } from '@/pages/public/PublicPlansPage'
import { ClassesPage } from '@/pages/member/ClassesPage'
import { BookingsPage } from '@/pages/member/BookingsPage'
import { MembershipPage } from '@/pages/member/MembershipPage'
import { TrainerSessionsPage } from '@/pages/trainer/TrainerSessionsPage'
import { TrainerMembersPage } from '@/pages/trainer/TrainerMembersPage'
import { PlansPage } from '@/pages/admin/PlansPage'
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage'

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="plans" element={<PublicPlansPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
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
