import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@/components/ui/molecules/Alert'
import { classesApi, toApiError } from '@/api'
import { homePathForRole, useAuth } from '@/auth'

const FEATURED_SIZE = 3

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  const featured = useQuery({
    queryKey: ['public', 'featured-classes'],
    queryFn: () => classesApi.list({ active_only: true, size: FEATURED_SIZE }),
  })

  const classes = featured.data?.items ?? []

  return (
    <div className="public-page">
      <section className="hero">
        <h1>Entrena a tu ritmo</h1>
        <p>
          Clases dirigidas, planes flexibles y reserva online. Descubre todo lo que el gimnasio
          puede ofrecerte y empieza hoy mismo.
        </p>
        <div className="public__actions public__actions--center">
          {isAuthenticated && user ? (
            <Link to={homePathForRole(user.role)} className="btn btn--primary">
              Ir a mi área
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn--primary">
                Crear cuenta
              </Link>
              <Link to="/login" className="btn btn--secondary">
                Iniciar sesión
              </Link>
            </>
          )}
          <Link to="/plans" className="btn btn--ghost">
            Ver planes
          </Link>
        </div>
      </section>

      <section className="public-section">
        <h2>Clases destacadas</h2>

        {featured.isError ? (
          <Alert variant="error">{toApiError(featured.error).message}</Alert>
        ) : null}

        {featured.isLoading ? <p className="table-status">Cargando…</p> : null}

        {featured.isSuccess && classes.length === 0 ? (
          <p className="table-status">Pronto publicaremos las clases.</p>
        ) : null}

        <div className="cards">
          {classes.map((gymClass) => (
            <article className="card" key={gymClass.id}>
              <h3 className="card__title">{gymClass.name}</h3>
              <p className="card__meta">{gymClass.capacity} plazas</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
