import { toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Button } from '@/components/ui/atoms/Button'
import { ProfileHeader } from '@/components/ui/molecules/ProfileHeader'
import { ChangePasswordForm } from '@/components/ui/organisms/ChangePasswordForm'
import { ProfileForm } from '@/components/ui/organisms/ProfileForm'
import { useProfile } from './useProfile'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { updateProfile, changePassword } = useProfile()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader name={user.full_name} role={user.role} />

      <section className="flex flex-col gap-3 rounded-card bg-surface p-6" aria-label="Mis datos">
        <h2 className="font-display text-title text-text">Mis datos</h2>
        <ProfileForm
          defaultName={user.full_name}
          defaultEmail={user.email}
          onSave={(values) => updateProfile.mutate(values)}
          isSaving={updateProfile.isPending}
          error={updateProfile.isError ? toApiError(updateProfile.error).message : null}
          message={updateProfile.isSuccess ? 'Perfil actualizado' : null}
        />
      </section>

      <section
        className="flex flex-col gap-3 rounded-card bg-surface p-6"
        aria-label="Cambiar contraseña"
      >
        <h2 className="font-display text-title text-text">Cambiar contraseña</h2>
        <ChangePasswordForm
          onSubmit={(values) => changePassword.mutate(values)}
          isSaving={changePassword.isPending}
          error={changePassword.isError ? toApiError(changePassword.error).message : null}
          message={changePassword.isSuccess ? 'Contraseña actualizada' : null}
        />
      </section>

      <div>
        <Button variant="danger" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
