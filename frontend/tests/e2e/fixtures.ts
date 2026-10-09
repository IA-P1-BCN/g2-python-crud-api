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

export type MockRoom = {
  id: number
  name: string
  capacity: number
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

export const defaultRooms: MockRoom[] = [
  { id: 1, name: 'Sala 1', capacity: 20 },
  { id: 2, name: 'Sala 2', capacity: 15 },
]

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
  {
    id: 2,
    name: 'Antiguo',
    description: null,
    price_cents: 1999,
    duration_days: 15,
    is_active: false,
    created_at: '2026-09-01T10:00:00Z',
  },
]

type MockApiOptions = {
  user: MockUser
  bookings?: MockBooking[]
  schedules?: MockSchedule[]
  classes?: MockClass[]
  rooms?: MockRoom[]
  membership?: MockMembership | null
  bookingError?: { status: number; detail: string }
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
  const rooms: MockRoom[] = options.rooms ?? defaultRooms
  const membership = options.membership === undefined ? defaultMembership : options.membership
  let nextBookingId = bookings.reduce((max, b) => Math.max(max, b.id), 0) + 1

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const params = url.searchParams
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

    if (path === '/api/v1/users' && method === 'GET') {
      const role = params.get('role')
      const items = Object.values(users).filter((user) => !role || user.role === role)
      return json(route, 200, toPage(items))
    }

    if (path === '/api/v1/classes' && method === 'GET') {
      const trainerId = params.get('trainer_id')
      const items = trainerId
        ? classes.filter((item) => item.trainer_id === Number(trainerId))
        : classes
      return json(route, 200, toPage(items))
    }

    if (path === '/api/v1/rooms' && method === 'GET') {
      return json(route, 200, toPage(rooms))
    }

    if (path === '/api/v1/class-schedules' && method === 'GET') {
      const classId = params.get('class_id')
      const dayOfWeek = params.get('day_of_week')
      let items = schedules
      if (classId) items = items.filter((item) => item.class_id === Number(classId))
      if (dayOfWeek) items = items.filter((item) => item.day_of_week === Number(dayOfWeek))
      return json(route, 200, toPage(items))
    }

    if (path === '/api/v1/membership-plans' && method === 'GET') {
      const activeOnly = params.get('active_only') === 'true'
      const items = activeOnly ? defaultPlans.filter((plan) => plan.is_active) : defaultPlans
      return json(route, 200, toPage(items))
    }

    if (path === '/api/v1/bookings' && method === 'GET') {
      const scheduleId = params.get('schedule_id')
      const onDate = params.get('on_date')
      let items = bookings
      if (scheduleId) items = items.filter((item) => item.schedule_id === Number(scheduleId))
      if (onDate) items = items.filter((item) => item.booking_date === onDate)
      return json(route, 200, toPage(items))
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
      if (options.bookingError) {
        return json(route, options.bookingError.status, {
          detail: options.bookingError.detail,
          code: 'business_rule',
        })
      }
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

    if (path === '/api/v1/me/dashboard' && method === 'GET') {
      const confirmed = bookings.filter((item) => item.status === 'confirmed')
      return json(route, 200, {
        membership: membership
          ? {
              membership_id: membership.id,
              plan_id: membership.plan_id,
              plan_name:
                defaultPlans.find((plan) => plan.id === membership.plan_id)?.name ?? 'Plan',
              start_date: membership.start_date,
              end_date: membership.end_date,
              status: membership.status,
              days_left: 60,
            }
          : null,
        upcoming_bookings: confirmed.map((item) => {
          const schedule = schedules.find((entry) => entry.id === item.schedule_id)
          const gymClass = classes.find((entry) => entry.id === schedule?.class_id)
          const room = rooms.find((entry) => entry.id === schedule?.room_id)
          return {
            booking_id: item.id,
            booking_date: item.booking_date,
            schedule_id: item.schedule_id,
            class_id: schedule?.class_id ?? 0,
            class_name: gymClass?.name ?? 'Clase',
            start_time: schedule?.start_time ?? '00:00:00',
            end_time: schedule?.end_time ?? '00:00:00',
            room_name: room?.name ?? null,
            trainer_name: users.trainer.full_name,
          }
        }),
        stats: {
          bookings_this_month: confirmed.length,
          total_bookings: bookings.length,
        },
      })
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
