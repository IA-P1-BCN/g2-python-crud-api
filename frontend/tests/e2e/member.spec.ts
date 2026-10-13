import { expect, test } from '@playwright/test'
import { loginAs, mockApi, users } from './fixtures'

test('el socio reserva desde el calendario, consulta y cancela, y ve su membresía', async ({
  page,
}) => {
  await mockApi(page, { user: users.member })
  await loginAs(page, 'member')

  // The member lands on their home with the empty next-booking state.
  await expect(page.getByRole('heading', { name: 'Hola, Socio Uno' })).toBeVisible()
  await expect(page.getByText('No tienes reservas próximas.')).toBeVisible()

  await page.goto('/member/classes')
  await expect(page.getByRole('heading', { name: 'Calendario de clases' })).toBeVisible()

  await page.getByRole('button', { name: 'Lunes' }).click()
  const yoga = page.getByRole('row', { name: /Yoga/ })
  await yoga.getByRole('button', { name: 'Ver detalle' }).click()
  await page.getByRole('button', { name: 'Reservar' }).click()
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

test('muestra el mensaje de error de la API al reservar', async ({ page }) => {
  await mockApi(page, {
    user: users.member,
    bookingError: { status: 400, detail: 'Necesitas una membresía activa para reservar' },
  })
  await loginAs(page, 'member')

  await page.goto('/member/classes')
  await page.getByRole('button', { name: 'Lunes' }).click()
  await page.getByRole('row', { name: /Yoga/ }).getByRole('button', { name: 'Ver detalle' }).click()
  await page.getByRole('button', { name: 'Reservar' }).click()

  await expect(page.getByText('Necesitas una membresía activa para reservar')).toBeVisible()
})
