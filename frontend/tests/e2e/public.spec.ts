import { expect, test } from '@playwright/test'
import { mockApi, users } from './fixtures'

test('la home y la página de planes son accesibles sin sesión', async ({ page }) => {
  await mockApi(page, { user: users.member })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Entrena a tu ritmo' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Crear cuenta' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Iniciar sesión' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Yoga' })).toBeVisible()

  await page.getByRole('link', { name: 'Planes', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Planes y precios' })).toBeVisible()
  await expect(page.getByText('Mensual')).toBeVisible()
  await expect(page.getByText(/39,99/)).toBeVisible()
  await expect(page.getByText('30 días')).toBeVisible()
  await expect(page.getByText('Antiguo')).toHaveCount(0)
})
