import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users, type MockRole } from './fixtures'

test('sin sesión, una ruta protegida lleva al login', async ({ page }) => {
  await mockApi(page, { user: users.member })

  await page.goto('/member/bookings')

  await expect(page).toHaveURL(/\/login$/)
})

const forbidden: Array<{ role: MockRole; path: string }> = [
  { role: 'member', path: '/admin/dashboard' },
  { role: 'member', path: '/trainer' },
  { role: 'trainer', path: '/admin/dashboard' },
  { role: 'trainer', path: '/member/bookings' },
  { role: 'admin', path: '/member/bookings' },
  { role: 'admin', path: '/trainer' },
]

for (const { role, path } of forbidden) {
  test(`el rol ${role} no puede entrar en ${path}`, async ({ page }) => {
    await mockApi(page, { user: users[role] })
    await loginAs(page, role)

    await page.goto(path)

    await expect(page).toHaveURL(/\/forbidden$/)
    await expect(page.getByRole('heading', { name: '403 · Acceso denegado' })).toBeVisible()
  })
}

test('con el rol correcto no se bloquea el acceso', async ({ page }) => {
  await mockApi(page, { user: users.admin })
  await loginAs(page, 'admin')

  await page.goto('/admin/dashboard')

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByRole('heading', { name: '403 · Acceso denegado' })).toHaveCount(0)
})
