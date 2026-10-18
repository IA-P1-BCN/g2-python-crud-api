import { useMutation } from '@tanstack/react-query'
import { authApi, usersApi } from '@/api'
import { useAuth } from '@/auth'
import type { ChangePasswordValues } from '@/components/ui/organisms/ChangePasswordForm'
import type { ProfileFormValues } from '@/components/ui/organisms/ProfileForm'

/** Update the current user's profile and password. */
export function useProfile() {
  const { user, updateUser } = useAuth()

  const updateProfile = useMutation({
    mutationFn: (values: ProfileFormValues) => usersApi.updateProfile(user!.id, values),
    onSuccess: (updated) => {
      updateUser(updated)
    },
  })

  const changePassword = useMutation({
    mutationFn: (values: ChangePasswordValues) => usersApi.changePassword(user!.id, values),
  })

  const setupTwoFactor = useMutation({
    mutationFn: () => authApi.setupTwoFactor(),
  })

  const enableTwoFactor = useMutation({
    mutationFn: (code: string) => authApi.enableTwoFactor({ code }),
  })

  const disableTwoFactor = useMutation({
    mutationFn: (code: string) => authApi.disableTwoFactor({ code }),
  })

  return { updateProfile, changePassword, setupTwoFactor, enableTwoFactor, disableTwoFactor }
}
