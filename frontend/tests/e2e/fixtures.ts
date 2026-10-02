import type { Page, Route } from '@playwright/test'

export type MockRole = 'member' | 'trainer' | 'admin'

export type MockUser = {
  id: number
  email: string
  full_name: string
  role: MockRole
  is_active: boolean
}

export type MockBooking = {
  id: number
  member_id: number
  class_name: string
  starts_at: string
  trainer_id: number | null
  status: 'active' | 'cancelled'
}

export const users: Record<MockRole, MockUser> = {
  member: {
    id: 1,
    email: 'socio@example.com',
    full_name: 'Socio Uno',
    role: 'member',
    is_active: true,
  },
  trainer: {
    id: 2,
    email: 'trainer@example.com',
    full_name: 'Entrenador Uno',
    role: 'trainer',
    is_active: true,
  },
  admin: {
    id: 3,
    email: 'admin@example.com',
    full_name: 'Admin Uno',
    role: 'admin',
    is_active: true,
  },
}

type MockApiOptions = {
  user: MockUser
  bookings?: MockBooking[]
}

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function pageMeta(total: number) {
  return { total, page: 1, size: 10, pages: Math.max(Math.ceil(total / 10), 1) }
}

/**
 * Simula el backend FastAPI interceptando las llamadas del front.
 * Todas las peticiones pasan por /api (proxy de Vite / variable VITE_API_URL).
 */
export async function mockApi(page: Page, options: MockApiOptions) {
  const bookings: MockBooking[] = options.bookings ?? []
  let nextBookingId = bookings.reduce((max, b) => Math.max(max, b.id), 0) + 1

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()

    if (path === '/api/auth/login' && method === 'POST') {
      return json(route, 200, {
        access_token: 'e2e-token',
        token_type: 'bearer',
        user: options.user,
      })
    }

    if (path === '/api/auth/me' && method === 'GET') {
      return json(route, 200, options.user)
    }

    if (path === '/api/members/me/bookings' && method === 'GET') {
      return json(route, 200, { items: bookings, meta: pageMeta(bookings.length) })
    }

    if (path === '/api/bookings' && method === 'POST') {
      const payload = request.postDataJSON() as { class_name: string; starts_at: string }
      const booking: MockBooking = {
        id: nextBookingId++,
        member_id: options.user.id,
        class_name: payload.class_name,
        starts_at: payload.starts_at,
        trainer_id: null,
        status: 'active',
      }
      bookings.push(booking)
      return json(route, 201, booking)
    }

    if (path.startsWith('/api/bookings/') && method === 'DELETE') {
      const id = Number(path.split('/').pop())
      const booking = bookings.find((item) => item.id === id)
      if (booking) booking.status = 'cancelled'
      return route.fulfill({ status: 204, body: '' })
    }

    if (path === '/api/trainer/members' && method === 'GET') {
      return json(route, 200, { items: [], meta: pageMeta(0) })
    }

    if (path === '/api/members' && method === 'GET') {
      return json(route, 200, { items: [], meta: pageMeta(0) })
    }

    if (path === '/api/plans' && method === 'GET') {
      return json(route, 200, { items: [], meta: pageMeta(0) })
    }

    return json(route, 404, { detail: `No mockeado: ${method} ${path}` })
  })
}

export async function loginAs(page: Page, role: MockRole) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(users[role].email)
  await page.getByLabel('Contraseña').fill('secret')
  await page.getByRole('button', { name: 'Entrar' }).click()
}
