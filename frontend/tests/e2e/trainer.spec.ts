import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users, type MockBooking } from './fixtures'

test('el entrenador ve sus clases y los inscritos por sesión y fecha', async ({ page }) => {
  const booking: MockBooking = {
    id: 1,
    member_id: 1,
    schedule_id: 1,
    booking_date: '2026-10-06',
    status: 'confirmed',
    created_at: '2026-10-06T09:00:00Z',
  }

  await mockApi(page, { user: users.trainer, bookings: [booking] })
  await loginAs(page, 'trainer')

  await expect(page.getByRole('heading', { name: 'Mis sesiones' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Yoga' })).toBeVisible()

  await page.getByLabel('Fecha').fill('2026-10-06')

  await expect(page.getByRole('cell', { name: 'Socio Uno' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'socio@example.com' })).toBeVisible()
  await expect(page.getByText('Confirmada')).toBeVisible()
})
