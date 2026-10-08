import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users } from './fixtures'

test('el entrenador ve sus sesiones de la semana', async ({ page }) => {
  await mockApi(page, { user: users.trainer })
  await loginAs(page, 'trainer')

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
