import { useState } from 'react'
import { toApiError } from '@/api'
import { useAuth } from '@/auth'
import { Button } from '@/components/ui/atoms/Button'
import { FormField } from '@/components/ui/molecules/FormField'
import { Alert } from '@/components/ui/molecules/Alert'
import { ProfileHeader } from '@/components/ui/molecules/ProfileHeader'
import { ChangePasswordForm } from '@/components/ui/organisms/ChangePasswordForm'
import { ProfileForm } from '@/components/ui/organisms/ProfileForm'
import { useProfile } from './useProfile'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { updateProfile, changePassword, setupTwoFactor, enableTwoFactor, disableTwoFactor } =
    useProfile()

  const [is2faActive, setIs2faActive] = useState(false)
  const [setupSecret, setSetupSecret] = useState<string | null>(null)
  const [setupOtpUrl, setSetupOtpUrl] = useState<string | null>(null)
  const [enableCode, setEnableCode] = useState('')
  const [disableCode, setDisableCode] = useState('')

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

      <section
        className="flex flex-col gap-3 rounded-card bg-surface p-6"
        aria-label="Verificación en dos pasos"
      >
        <h2 className="font-display text-title text-text">Verificación en dos pasos</h2>

        {!is2faActive ? (
          <>
            {setupSecret ? (
              <>
                <p className="text-small text-text-muted">
                  Guarda este secreto en tu aplicación de autenticación y, si quieres, abre el
                  enlace otpauth.
                </p>
                <code className="break-all rounded bg-bg p-2 text-small text-text">
                  {setupSecret}
                </code>
                {setupOtpUrl ? (
                  <a className="text-primary underline" href={setupOtpUrl}>
                    Abrir otpauth_url
                  </a>
                ) : null}
                <FormField
                  label="Código de 6 cifras"
                  name="enable-code"
                  value={enableCode}
                  onChange={(event) => setEnableCode(event.target.value)}
                  placeholder="123456"
                  required
                />
                <Button
                  isLoading={enableTwoFactor.isPending}
                  onClick={() => {
                    enableTwoFactor.mutate(enableCode, {
                      onSuccess: () => {
                        setIs2faActive(true)
                        setSetupSecret(null)
                        setSetupOtpUrl(null)
                        setEnableCode('')
                      },
                    })
                  }}
                >
                  Activar
                </Button>
                {enableTwoFactor.isError ? (
                  <Alert variant="error">{toApiError(enableTwoFactor.error).message}</Alert>
                ) : null}
              </>
            ) : (
              <Button
                isLoading={setupTwoFactor.isPending}
                onClick={() =>
                  setupTwoFactor.mutate(undefined, {
                    onSuccess: (data) => {
                      setSetupSecret(data.secret)
                      setSetupOtpUrl(data.otpauth_url)
                      setEnableCode('')
                    },
                  })
                }
              >
                Activar verificación en dos pasos
              </Button>
            )}
            {setupTwoFactor.isError ? (
              <Alert variant="error">{toApiError(setupTwoFactor.error).message}</Alert>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-small text-text-muted">
              La verificación en dos pasos está activa para esta cuenta.
            </p>
            <FormField
              label="Código de 6 cifras"
              name="disable-code"
              value={disableCode}
              onChange={(event) => setDisableCode(event.target.value)}
              placeholder="123456"
              required
            />
            <Button
              variant="danger"
              isLoading={disableTwoFactor.isPending}
              onClick={() => {
                disableTwoFactor.mutate(disableCode, {
                  onSuccess: () => {
                    setIs2faActive(false)
                    setDisableCode('')
                  },
                })
              }}
            >
              Desactivar
            </Button>
            {disableTwoFactor.isError ? (
              <Alert variant="error">{toApiError(disableTwoFactor.error).message}</Alert>
            ) : null}
          </>
        )}
      </section>

      <div>
        <Button variant="danger" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
