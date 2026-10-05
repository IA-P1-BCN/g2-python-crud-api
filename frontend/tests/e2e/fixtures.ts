import type { Page, Route } from '@playwright/test'

export type MockRole = 'member' | 'trainer' | 'admin'

export type MockUser = {
  id: number
  email: string
  full_name: string
  role: MockRole
  is_active: boolean
  created_at: string
}

export type MockClass = {
  id: number
  name: string
  capacity: number
  trainer_id: number
  room_id: number | null
  is_active: boolean
  created_at: string
}

export type MockSchedule = {
  id: number
  class_id: number
  day_of_week: number
  start_time: string
  end_time: string
  room_id: number | null
  created_at: string
}

export type MockBooking = {
  id: number
  member_id: number
  schedule_id: number
  booking_date: string
  status: 'confirmed' | 'cancelled'
  created_at: string
}

export type MockMembership = {
  id: number
  user_id: number
  plan_id: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
}

export type MockPlan = {
  id: number
  name: string
  description: string | null
  price_cents: number
  duration_days: number
  is_active: boolean
  created_at: string
}

export const users: Record<MockRole, MockUser> = {
  member: {
    id: 1,
    email: 'socio@example.com',
    full_name: 'Socio Uno',
    role: 'member',
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
  trainer: {
    id: 2,
    email: 'trainer@example.com',
    full_name: 'Entrenador Uno',
    role: 'trainer',
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
  admin: {
    id: 3,
    email: 'admin@example.com',
    full_name: 'Admin Uno',
    role: 'admin',
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
}

export const defaultClasses: MockClass[] = [
  {
    id: 1,
    name: 'Yoga',
    capacity: 20,
    trainer_id: 2,
    room_id: 1,
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Spinning',
    capacity: 15,
    trainer_id: 2,
    room_id: 2,
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
]

export const defaultSchedules: MockSchedule[] = [
  {
    id: 1,
    class_id: 1,
    day_of_week: 0,
    start_time: '10:00:00',
    end_time: '11:00:00',
    room_id: 1,
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 2,
    class_id: 2,
    day_of_week: 2,
    start_time: '18:00:00',
    end_time: '19:00:00',
    room_id: 2,
    created_at: '2026-10-01T10:00:00Z',
  },
]

export const defaultMembership: MockMembership = {
  id: 1,
  user_id: 1,
  plan_id: 1,
  start_date: '2026-10-01',
  end_date: '2026-12-31',
  status: 'active',
  created_at: '2026-10-01T10:00:00Z',
}

export const defaultPlans: MockPlan[] = [
  {
    id: 1,
    name: 'Mensual',
    description: null,
    price_cents: 3999,
    duration_days: 30,
    is_active: true,
    created_at: '2026-10-01T10:00:00Z',
  },
]

type MockApiOptions = {
  user: MockUser
  bookings?: MockBooking[]
  schedules?: MockSchedule[]
  classes?: MockClass[]
  membership?: MockMembership | null
}

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function toPage<T>(items: T[], size = 10) {
  return {
    items,
    total: items.length,
    page: 1,
    size,
    pages: Math.max(Math.ceil(items.length / size), 1),
  }
}

/**
 * Simulates the FastAPI backend by intercepting the requests the frontend makes
 * to /api/v1 (Vite proxy / VITE_API_URL).
 */
export async function mockApi(page: Page, options: MockApiOptions) {
  const bookings: MockBooking[] = options.bookings ?? []
  const schedules: MockSchedule[] = options.schedules ?? defaultSchedules
  const classes: MockClass[] = options.classes ?? defaultClasses
  const membership = options.membership === undefined ? defaultMembership : options.membership
  let nextBookingId = bookings.reduce((max, b) => Math.max(max, b.id), 0) + 1

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()

    if (path === '/api/v1/auth/login' && method === 'POST') {
      return json(route, 200, {
        access_token: 'e2e-token',
        token_type: 'bearer',
        user: options.user,
      })
    }

    if (path === '/api/v1/auth/register' && method === 'POST') {
      return json(route, 201, {
        access_token: 'e2e-token',
        token_type: 'bearer',
        user: options.user,
      })
    }

    if (path === '/api/v1/auth/me' && method === 'GET') {
      return json(route, 200, options.user)
    }

    if (path === '/api/v1/classes' && method === 'GET') {
      return json(route, 200, toPage(classes))
    }

    if (path === '/api/v1/class-schedules' && method === 'GET') {
      return json(route, 200, toPage(schedules))
    }

    if (path === '/api/v1/membership-plans' && method === 'GET') {
      return json(route, 200, toPage(defaultPlans))
    }

    const bookingsMatch = path.match(/^\/api\/v1\/users\/(\d+)\/bookings$/)
    if (bookingsMatch && method === 'GET') {
      const userId = Number(bookingsMatch[1])
      return json(route, 200, toPage(bookings.filter((item) => item.member_id === userId)))
    }

    const membershipsMatch = path.match(/^\/api\/v1\/users\/(\d+)\/memberships$/)
    if (membershipsMatch && method === 'GET') {
      const items = membership ? [membership] : []
      return json(route, 200, toPage(items))
    }

    if (path === '/api/v1/bookings' && method === 'POST') {
      const payload = request.postDataJSON() as {
        member_id: number
        schedule_id: number
        booking_date: string
      }
      const booking: MockBooking = {
        id: nextBookingId++,
        member_id: payload.member_id,
        schedule_id: payload.schedule_id,
        booking_date: payload.booking_date,
        status: 'confirmed',
        created_at: '2026-10-05T10:00:00Z',
      }
      bookings.push(booking)
      return json(route, 201, booking)
    }

    if (path.startsWith('/api/v1/bookings/') && method === 'DELETE') {
      const id = Number(path.split('/').pop())
      const booking = bookings.find((item) => item.id === id)
      if (booking) booking.status = 'cancelled'
      return route.fulfill({ status: 204, body: '' })
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
