import { expect, test } from '@playwright/test'

// Spec de humo para comprobar que el runner y la app arrancan.
// P4 sustituye/amplía esto con los flujos reales (login, reservar, cancelar,
// acceso por rol). El helper `fixtures.ts` sirve para simular la API.
test('la pantalla de login se muestra', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'Acceso al gimnasio' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})
