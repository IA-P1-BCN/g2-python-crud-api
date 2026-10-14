import { expect, test } from '@playwright/test'
import { mockApi, users } from './fixtures'

test('el registro crea la sesión y entra al área de socio', async ({ page }) => {
  await mockApi(page, { user: users.member })

  await page.goto('/register')
  await page.getByLabel('Nombre completo').fill('Nueva Socia')
  await page.getByLabel('Correo electrónico').fill('nueva@example.com')
  await page.getByLabel('Crea una contraseña').fill('Athletica123!')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  await expect(page.getByRole('heading', { name: 'Hola, Socio Uno' })).toBeVisible()
})
