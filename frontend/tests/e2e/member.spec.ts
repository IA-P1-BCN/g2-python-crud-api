import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users } from './fixtures'

test('el socio reserva, consulta y cancela una clase y ve su membresía', async ({ page }) => {
  await mockApi(page, { user: users.member })
  await loginAs(page, 'member')

  await expect(page.getByRole('heading', { name: 'Clases y horarios' })).toBeVisible()

  const yoga = page.getByRole('row', { name: /Yoga/ })
  await yoga.getByRole('button', { name: 'Reservar' }).click()
  await expect(page.getByText('Reserva confirmada.')).toBeVisible()

  await page.getByRole('link', { name: 'Mis reservas' }).click()
  await expect(page.getByRole('heading', { name: 'Mis reservas' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Yoga' })).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).first().click()
  await expect(page.getByRole('cell', { name: 'Cancelada' })).toBeVisible()

  await page.getByRole('link', { name: 'Mi membresía' }).click()
  await expect(page.getByText('Mensual')).toBeVisible()
  await expect(page.getByText('Activa')).toBeVisible()
})

test('muestra un aviso cuando el socio no tiene membresía', async ({ page }) => {
  await mockApi(page, { user: users.member, membership: null })
  await loginAs(page, 'member')

  await page.getByRole('link', { name: 'Mi membresía' }).click()

  await expect(page.getByText('No tienes ninguna membresía asignada.')).toBeVisible()
})
