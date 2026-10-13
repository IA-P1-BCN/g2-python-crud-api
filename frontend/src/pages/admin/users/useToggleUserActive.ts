import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api'
import type { User } from '@/types/api'

/** Signs a user off, or reactivates them, after the admin confirms it. */
export function useToggleUserActive() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (user: User): Promise<void> => {
      if (user.is_active) await usersApi.deactivate(user.id)
      else await usersApi.reactivate(user.id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  function toggle(user: User) {
    const question = user.is_active
      ? `¿Dar de baja a ${user.full_name}? Se conserva su historial.`
      : `¿Reactivar a ${user.full_name}?`
    if (window.confirm(question)) mutation.mutate(user)
  }

  return { toggle, error: mutation.error }
}
