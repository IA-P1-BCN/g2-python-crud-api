/**
 * Password strength rule, mirroring `backend/app/schemas/password.py`.
 * Login does not use it, so accounts created before the rule can still sign in.
 */

export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_RULE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'

export type PasswordCheck = {
  id: string
  label: string
  met: boolean
}

export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { id: 'length', label: 'Al menos 8 caracteres', met: value.length >= MIN_PASSWORD_LENGTH },
    { id: 'uppercase', label: 'Una mayúscula', met: /[A-Z]/.test(value) },
    { id: 'lowercase', label: 'Una minúscula', met: /[a-z]/.test(value) },
    { id: 'number', label: 'Un número', met: /\d/.test(value) },
    { id: 'special', label: 'Un carácter especial', met: /[^A-Za-z0-9\s]/.test(value) },
  ]
}

export function isStrongPassword(value: string): boolean {
  return passwordChecks(value).every((check) => check.met)
}

/** Explains what is missing, or `null` when the password is valid. */
export function passwordErrorMessage(value: string): string | null {
  return isStrongPassword(value) ? null : PASSWORD_RULE
}
