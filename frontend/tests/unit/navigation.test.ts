import { describe, expect, it } from 'vitest'
import { NAV_BY_ROLE, navForRole } from '@/lib/navigation'

describe('role navigation config', () => {
  it('define el menú del socio', () => {
    expect(navForRole('member').map((item) => item.label)).toEqual([
      'Inicio',
      'Reservas',
      'Mi plan',
    ])
  })

  it('define el menú del entrenador', () => {
    expect(navForRole('trainer').map((item) => item.label)).toEqual(['Inicio', 'Sesiones'])
  })

  it('define el menú del administrador', () => {
    expect(navForRole('admin').map((item) => item.label)).toEqual([
      'Dashboard',
      'Socios',
      'Planes',
      'Membresías',
      'Salas',
      'Reservas',
      'Clases',
      'Horarios',
    ])
  })

  it('cada elemento tiene ruta, etiqueta e icono', () => {
    for (const items of Object.values(NAV_BY_ROLE)) {
      for (const item of items) {
        expect(item.to).toMatch(/^\//)
        expect(item.label.length).toBeGreaterThan(0)
        expect(item.icon.length).toBeGreaterThan(0)
      }
    }
  })
})
