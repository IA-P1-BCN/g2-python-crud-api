import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@/components/ui/molecules/Alert'
import { membershipPlansApi, toApiError } from '@/api'
import { homePathForRole, useAuth } from '@/auth'
import { formatPrice } from '@/lib/format'

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
    <div className="public-page">
      <section className="public-section">
        <h1>Planes y precios</h1>
        <p className="card__meta">
          Elige el plan que mejor se adapta a ti. Todos incluyen acceso a las clases y reserva
          online.
        </p>

        {plans.isError ? <Alert variant="error">{toApiError(plans.error).message}</Alert> : null}

        {plans.isLoading ? <p className="table-status">Cargando…</p> : null}

        {plans.isSuccess && items.length === 0 ? (
          <p className="table-status">No hay planes disponibles por el momento.</p>
        ) : null}

        <div className="cards cards--plans">
          {items.map((plan) => (
            <article className="card plan-card" key={plan.id}>
              <h2 className="card__title">{plan.name}</h2>
              <p className="plan-card__price">{formatPrice(plan.price_cents)}</p>
              <p className="plan-card__duration">{plan.duration_days} días</p>
              {plan.description ? <p className="card__meta">{plan.description}</p> : null}
              <Link to={cta.to} className="btn btn--primary">
                {cta.label}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
