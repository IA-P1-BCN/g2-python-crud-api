import { describe, expect, it } from 'vitest'
import {
  isStrongPassword,
  PASSWORD_RULE,
  passwordChecks,
  passwordErrorMessage,
} from '@/lib/password'

describe('password rule', () => {
  it('acepta una contraseña fuerte', () => {
    expect(isStrongPassword('Athletica123!')).toBe(true)
    expect(passwordErrorMessage('Athletica123!')).toBeNull()
  })

  it('rechaza una contraseña débil y explica la regla', () => {
    expect(isStrongPassword('secret123')).toBe(false)
    expect(passwordErrorMessage('secret123')).toBe(PASSWORD_RULE)
  })

  it('marca cada condición por separado', () => {
    const checks = passwordChecks('aa')
    const byId = new Map(checks.map((check) => [check.id, check.met]))

    expect(byId.get('length')).toBe(false)
    expect(byId.get('uppercase')).toBe(false)
    expect(byId.get('lowercase')).toBe(true)
    expect(byId.get('number')).toBe(false)
    expect(byId.get('special')).toBe(false)
  })
})
