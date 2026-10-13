import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, setUnauthorizedHandler, toApiError } from '@/api'
import type { LoginRequest, RegisterRequest, Role, Token, User } from '@/types/api'
import { AuthContext, type AuthContextValue } from './context'
import { tokenStorage } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser())
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setToken(null)
    setError(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const updateUser = useCallback((updatedUser: User) => {
    tokenStorage.setUser(updatedUser)
    setUser(updatedUser)
  }, [])

  // Cuando el cliente axios recibe un 401 (token caducado), cerramos sesión.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear()
      setUser(null)
      setToken(null)
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  // Restaura la sesión guardada validando el token contra el backend (/auth/me).
  useEffect(() => {
    if (!tokenStorage.getToken()) return
    let active = true
    authApi
      .me()
      .then((current) => {
        if (!active) return
        tokenStorage.setUser(current)
        setUser(current)
      })
      .catch(() => {
        // Un 401 lo gestiona el interceptor (borra la sesión y redirige al login).
      })
    return () => {
      active = false
    }
  }, [])

  const startSession = useCallback((result: Token) => {
    tokenStorage.setSession(result.access_token, result.user)
    setToken(result.access_token)
    setUser(result.user)
    return result.user
  }, [])

  const login = useCallback(
    async (payload: LoginRequest) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await authApi.login(payload)
        return startSession(result)
      } catch (err) {
        setError(toApiError(err).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [startSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await authApi.register(payload)
        return startSession(result)
      } catch (err) {
        setError(toApiError(err).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [startSession],
  )

  const hasRole = useCallback(
    (...roles: Role[]) => user !== null && roles.includes(user.role),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: token !== null && user !== null,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      hasRole,
    }),
    [user, token, isLoading, error, login, register, logout, updateUser, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
