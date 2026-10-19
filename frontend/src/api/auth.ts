import { apiClient } from './client'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  Token,
  TotpCode,
  TotpSetup,
  User,
} from '@/types/api'

/** JWT auth endpoints. Paths are relative to `/api/v1`. */
export const authApi = {
  async login(payload: LoginRequest): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterRequest): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/register', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },

  /** Revokes the session server-side (204). Send the refresh token so it is revoked too. */
  async logout(refreshToken: string | null): Promise<void> {
    await apiClient.post('/auth/logout', refreshToken ? { refresh_token: refreshToken } : undefined)
  },

  /** Confirms the email with the token from the verification link (204, no body). */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token })
  },

  /** Asks for a recovery link (202 always, whether the email exists or not). */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', payload)
  },

  /** Sets the new password with the token of the recovery link (204). */
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', payload)
  },

  async setupTwoFactor(): Promise<TotpSetup> {
    const { data } = await apiClient.post<TotpSetup>('/auth/2fa/setup')
    return data
  },

  async enableTwoFactor(payload: TotpCode): Promise<void> {
    await apiClient.post('/auth/2fa/enable', payload)
  },

  async disableTwoFactor(payload: TotpCode): Promise<void> {
    await apiClient.post('/auth/2fa/disable', payload)
  },
}
