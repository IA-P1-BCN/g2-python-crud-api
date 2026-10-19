import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users } from './fixtures'

test('el entrenador ve el resumen de hoy en su inicio', async ({ page }) => {
  await mockApi(page, { user: users.trainer })
  await loginAs(page, 'trainer')

  await expect(page.getByRole('heading', { name: 'Hola, Entrenador Uno' })).toBeVisible()
  await expect(page.getByText('Sesiones hoy', { exact: true })).toBeVisible()
  await expect(page.getByText('Miembros hoy', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sesiones de hoy' })).toBeVisible()
})

test('el entrenador ve la lista de socios desde el menú', async ({ page }) => {
  await mockApi(page, { user: users.trainer })
  await loginAs(page, 'trainer')
  await expect(page.getByRole('heading', { name: 'Hola, Entrenador Uno' })).toBeVisible()

  await page.getByRole('link', { name: 'Socios' }).first().click()

  await expect(page.getByRole('heading', { name: 'Mis socios' })).toBeVisible()
  await expect(page.getByText('Socio Uno')).toBeVisible()
  await expect(page.getByText('socio@example.com')).toBeVisible()
})

test('el entrenador ve sus sesiones de la semana', async ({ page }) => {
  await mockApi(page, { user: users.trainer })
  await loginAs(page, 'trainer')
  await expect(page.getByRole('heading', { name: 'Hola, Entrenador Uno' })).toBeVisible()

  await page.goto('/trainer/sessions')
  await expect(page.getByRole('heading', { name: 'Mis sesiones' })).toBeVisible()

  // The first schedule (Yoga) is on Monday; pick that day chip.
  await page.getByRole('button', { name: /^Lun / }).click()

  await expect(page.getByText('Yoga')).toBeVisible()
  await expect(page.getByText('10:00 – 11:00 · Sala 1')).toBeVisible()
  await expect(page.getByText('0 / 20 inscritos')).toBeVisible()

  // Open the enrolled members panel for the selected session.
  await page.getByRole('button', { name: 'Ver inscritos' }).click()
  await expect(page.getByRole('heading', { name: 'Yoga', level: 2 })).toBeVisible()
  await expect(page.getByText('No hay miembros inscritos.')).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(page.getByRole('heading', { name: 'Yoga', level: 2 })).toHaveCount(0)
})
