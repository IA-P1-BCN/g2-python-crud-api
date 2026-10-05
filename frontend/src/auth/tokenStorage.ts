import type { User } from '@/types/api'

const TOKEN_KEY = 'gym.token'
const USER_KEY = 'gym.user'

/**
 * Único punto de acceso al almacenamiento de la sesión.
 * El cliente axios lee el token desde aquí; AuthContext escribe/borra.
 * Guardamos en localStorage para sobrevivir a recargas (el token es Bearer,
 * no una cookie HttpOnly, por eso la seguridad real vive en el backend).
 */
export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
  setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
