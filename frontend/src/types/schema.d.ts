/**
 * Tipos generados automáticamente desde el OpenAPI de FastAPI.
 *
 * NO editar a mano. Regenera con:
 *   npm run api:types          # usa ${VITE_API_URL}/openapi.json
 *   npm run api:types:file     # usa ./openapi.json
 *
 * Si el backend cambia un campo, este fichero cambia y el front deja de
 * compilar: el contrato roto se detecta en CI.
 */
export interface paths {
  '/auth/login': {
    post: operations['login']
  }
  '/auth/me': {
    get: operations['getCurrentUser']
  }
  '/plans': {
    get: operations['listPlans']
    post: operations['createPlan']
  }
  '/plans/{plan_id}': {
    get: operations['getPlan']
    patch: operations['updatePlan']
    delete: operations['deletePlan']
  }
  '/members': {
    get: operations['listMembers']
  }
  '/members/me/bookings': {
    get: operations['listMyBookings']
  }
  '/bookings': {
    post: operations['createBooking']
  }
  '/bookings/{booking_id}': {
    delete: operations['cancelBooking']
  }
  '/trainer/members': {
    get: operations['listTrainerMembers']
  }
}

export interface components {
  schemas: {
    Role: 'member' | 'trainer' | 'admin'

    User: {
      id: number
      email: string
      full_name: string
      role: components['schemas']['Role']
      is_active: boolean
    }

    LoginRequest: {
      email: string
      password: string
    }

    Token: {
      access_token: string
      token_type: string
      user: components['schemas']['User']
    }

    Plan: {
      id: number
      name: string
      price_cents: number
      duration_days: number
      description?: string | null
      is_active: boolean
    }

    PlanCreate: {
      name: string
      price_cents: number
      duration_days: number
      description?: string | null
    }

    PlanUpdate: {
      name?: string
      price_cents?: number
      duration_days?: number
      description?: string | null
      is_active?: boolean
    }

    Member: {
      id: number
      user_id: number
      full_name: string
      email: string
      plan_id?: number | null
      joined_at: string
    }

    Booking: {
      id: number
      member_id: number
      class_name: string
      starts_at: string
      trainer_id?: number | null
      status: 'active' | 'cancelled'
    }

    BookingCreate: {
      class_name: string
      starts_at: string
    }

    PageMeta: {
      total: number
      page: number
      size: number
      pages: number
    }

    PlanPage: {
      items: components['schemas']['Plan'][]
      meta: components['schemas']['PageMeta']
    }

    MemberPage: {
      items: components['schemas']['Member'][]
      meta: components['schemas']['PageMeta']
    }

    BookingPage: {
      items: components['schemas']['Booking'][]
      meta: components['schemas']['PageMeta']
    }

    HTTPValidationError: {
      detail?: components['schemas']['ValidationError'][]
    }

    ValidationError: {
      loc: (string | number)[]
      msg: string
      type: string
    }
  }
}

export type Role = components['schemas']['Role']
export type User = components['schemas']['User']
export type LoginRequest = components['schemas']['LoginRequest']
export type Token = components['schemas']['Token']
export type Plan = components['schemas']['Plan']
export type PlanCreate = components['schemas']['PlanCreate']
export type PlanUpdate = components['schemas']['PlanUpdate']
export type Member = components['schemas']['Member']
export type Booking = components['schemas']['Booking']
export type BookingCreate = components['schemas']['BookingCreate']
export type PageMeta = components['schemas']['PageMeta']
export type PlanPage = components['schemas']['PlanPage']
export type MemberPage = components['schemas']['MemberPage']
export type BookingPage = components['schemas']['BookingPage']
export type Paginated<T> = {
  items: T[]
  meta: PageMeta
}

export type LoginResponse = components['schemas']['Token']

export interface operations {
  login: {
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginRequest']
      }
    }
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['Token']
        }
      }
      401: {
        content: {
          'application/json': components['schemas']['HTTPValidationError']
        }
      }
    }
  }
  getCurrentUser: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['User']
        }
      }
    }
  }
  listPlans: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['PlanPage']
        }
      }
    }
  }
  createPlan: {
    requestBody: {
      content: {
        'application/json': components['schemas']['PlanCreate']
      }
    }
    responses: {
      201: {
        content: {
          'application/json': components['schemas']['Plan']
        }
      }
    }
  }
  getPlan: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['Plan']
        }
      }
    }
  }
  updatePlan: {
    requestBody: {
      content: {
        'application/json': components['schemas']['PlanUpdate']
      }
    }
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['Plan']
        }
      }
    }
  }
  deletePlan: {
    responses: {
      204: {
        content: never
      }
    }
  }
  listMembers: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['MemberPage']
        }
      }
    }
  }
  listMyBookings: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['BookingPage']
        }
      }
    }
  }
  createBooking: {
    requestBody: {
      content: {
        'application/json': components['schemas']['BookingCreate']
      }
    }
    responses: {
      201: {
        content: {
          'application/json': components['schemas']['Booking']
        }
      }
    }
  }
  cancelBooking: {
    responses: {
      204: {
        content: never
      }
    }
  }
  listTrainerMembers: {
    responses: {
      200: {
        content: {
          'application/json': components['schemas']['MemberPage']
        }
      }
    }
  }
}
