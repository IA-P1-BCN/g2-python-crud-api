import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { buttonStyles } from '@/components/ui/atoms/Button'
import { PlansSection } from '@/components/ui/organisms/PlansSection'
import { membershipPlansApi, toApiError } from '@/api'
import { homePathForRole, useAuth } from '@/auth'

export function PublicPlansPage() {
  const { isAuthenticated, user } = useAuth()

  const plans = useQuery({
    queryKey: ['public', 'plans'],
    queryFn: () => membershipPlansApi.list({ active_only: true, size: 100 }),
  })

  const items = plans.data?.items ?? []
  const cta =
    isAuthenticated && user
      ? { to: homePathForRole(user.role), label: 'Ir a mi área' }
      : { to: '/register', label: 'Empezar' }

  return (
    <PlansSection
      titleAs="h1"
      title="Planes y precios"
      plans={items.map((plan) => ({
        id: plan.id,
        name: plan.name,
        priceCents: plan.price_cents,
        durationDays: plan.duration_days,
        description: plan.description,
      }))}
      isLoading={plans.isLoading}
      error={plans.isError ? toApiError(plans.error).message : null}
      renderAction={() => (
        <Link to={cta.to} className={buttonStyles({ variant: 'primary', fullWidth: true })}>
          {cta.label}
        </Link>
      )}
    />
  )
}
