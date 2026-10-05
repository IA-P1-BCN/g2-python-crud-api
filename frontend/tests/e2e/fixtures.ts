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
  schedule_id: number
  class_name: string
  starts_at: string
  trainer_id: number | null
  status: 'active' | 'cancelled'
}

export type MockSchedule = {
  id: number
  class_id: number
  class_name: string
  description: string | null
  day_of_week: number
  start_time: string
  end_time: string
  room: string | null
  capacity: number
  booked_count: number
  remaining_spots: number
}

export type MockMembership = {
  id: number
  user_id: number
  plan_id: number
  plan_name: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
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

export const defaultSchedules: MockSchedule[] = [
  {
    id: 1,
    class_id: 1,
    class_name: 'Yoga',
    description: null,
    day_of_week: 0,
    start_time: '10:00:00',
    end_time: '11:00:00',
    room: 'Sala 1',
    capacity: 2,
    booked_count: 0,
    remaining_spots: 2,
  },
  {
    id: 2,
    class_id: 2,
    class_name: 'Spinning',
    description: null,
    day_of_week: 2,
    start_time: '18:00:00',
    end_time: '19:00:00',
    room: 'Sala 2',
    capacity: 1,
    booked_count: 1,
    remaining_spots: 0,
  },
]

export const defaultMembership: MockMembership = {
  id: 1,
  user_id: 1,
  plan_id: 1,
  plan_name: 'Mensual',
  start_date: '2026-10-01',
  end_date: '2026-12-31',
  status: 'active',
}

type MockApiOptions = {
  user: MockUser
  bookings?: MockBooking[]
  schedules?: MockSchedule[]
  membership?: MockMembership | null
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
  const schedules: MockSchedule[] = options.schedules ?? defaultSchedules
  const membership = options.membership === undefined ? defaultMembership : options.membership
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

    if (path === '/api/auth/register' && method === 'POST') {
      return json(route, 201, {
        access_token: 'e2e-token',
        token_type: 'bearer',
        user: options.user,
      })
    }

    if (path === '/api/auth/me' && method === 'GET') {
      return json(route, 200, options.user)
    }

    if (path === '/api/class-schedules' && method === 'GET') {
      return json(route, 200, { items: schedules, meta: pageMeta(schedules.length) })
    }

    if (path === '/api/classes' && method === 'GET') {
      return json(route, 200, { items: [], meta: pageMeta(0) })
    }

    if (path === '/api/members/me/bookings' && method === 'GET') {
      return json(route, 200, { items: bookings, meta: pageMeta(bookings.length) })
    }

    if (path === '/api/members/me/membership' && method === 'GET') {
      if (membership === null) {
        return json(route, 404, { detail: 'Sin membresía' })
      }
      return json(route, 200, membership)
    }

    if (path === '/api/bookings' && method === 'POST') {
      const payload = request.postDataJSON() as { schedule_id: number }
      const schedule = schedules.find((item) => item.id === payload.schedule_id)
      const booking: MockBooking = {
        id: nextBookingId++,
        member_id: options.user.id,
        schedule_id: payload.schedule_id,
        class_name: schedule?.class_name ?? 'Clase',
        starts_at: '2026-10-06T10:00:00',
        trainer_id: null,
        status: 'active',
      }
      bookings.push(booking)
      if (schedule && schedule.remaining_spots > 0) {
        schedule.remaining_spots -= 1
        schedule.booked_count += 1
      }
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
