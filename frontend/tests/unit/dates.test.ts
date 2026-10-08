import { describe, expect, it } from 'vitest'
import { currentPeriodRange, toIsoDate } from '@/lib/dates'

// Thursday 8 October 2026
const TODAY = new Date(2026, 9, 8, 18, 30)

describe('dates', () => {
  it('formatea la fecha local como YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('la semana empieza el lunes', () => {
    expect(currentPeriodRange('week', TODAY)).toEqual({ from: '2026-10-05', to: '2026-10-08' })
  })

  it('un domingo pertenece a la semana que empezó el lunes anterior', () => {
    expect(currentPeriodRange('week', new Date(2026, 9, 11))).toEqual({
      from: '2026-10-05',
      to: '2026-10-11',
    })
  })

  it('el mes empieza el día 1', () => {
    expect(currentPeriodRange('month', TODAY)).toEqual({ from: '2026-10-01', to: '2026-10-08' })
  })

  it('el año empieza el 1 de enero', () => {
    expect(currentPeriodRange('year', TODAY)).toEqual({ from: '2026-01-01', to: '2026-10-08' })
  })
})
