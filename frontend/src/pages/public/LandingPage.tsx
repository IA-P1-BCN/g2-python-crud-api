import { Link } from 'react-router-dom'
import { toApiError } from '@/api'
import { homePathForRole, useAuth } from '@/auth'
import { BenefitsSection } from '@/components/ui/organisms/BenefitsSection'
import { FeaturedClassesSection } from '@/components/ui/organisms/FeaturedClassesSection'
import { HeroSection } from '@/components/ui/organisms/HeroSection'
import { LandingFooter } from '@/components/ui/organisms/LandingFooter'
import { PlansSection } from '@/components/ui/organisms/PlansSection'
import type { FeatureItemProps } from '@/components/ui/molecules/FeatureItem'
import { useLandingData } from './useLandingData'

const PRIMARY_LINK = 'rounded-full bg-primary px-6 py-3 font-display text-body text-ink'
const SECONDARY_LINK = 'rounded-full border border-line px-6 py-3 font-display text-body text-text'

const BENEFITS: FeatureItemProps[] = [
  {
    icon: 'calendar',
    title: 'Reserva online',
    text: 'Consulta los horarios y reserva tu plaza en segundos.',
  },
  {
    icon: 'users',
    title: 'Clases para todos',
    text: 'Yoga, spinning, boxeo y mucho más, con monitores expertos.',
  },
  {
    icon: 'dumbbell',
    title: 'A tu ritmo',
    text: 'Planes flexibles que se adaptan a tu día a día.',
  },
]

export function LandingPage() {
  const { isAuthenticated, user } = useAuth()
  const { plans, featuredClasses, isLoading, isError, error } = useLandingData()

  const errorMessage = isError ? toApiError(error).message : null
  const primary =
    isAuthenticated && user
      ? { to: homePathForRole(user.role), label: 'Ir a mi área' }
      : { to: '/register', label: 'Hazte socio' }

  return (
    <div className="flex flex-col gap-10">
      <HeroSection
        title="Entrena a tu ritmo"
        subtitle="Clases dirigidas, planes flexibles y reserva online. Descubre todo lo que el gimnasio puede ofrecerte y empieza hoy mismo."
        actions={
          <>
            <Link to={primary.to} className={PRIMARY_LINK}>
              {primary.label}
            </Link>
            {!isAuthenticated ? (
              <Link to="/login" className={SECONDARY_LINK}>
                Entrar
              </Link>
            ) : null}
          </>
        }
      />

      <BenefitsSection items={BENEFITS} />

      <PlansSection
        plans={plans}
        isLoading={isLoading}
        error={errorMessage}
        renderAction={() => (
          <Link to="/register" className={PRIMARY_LINK}>
            Hazte socio
          </Link>
        )}
      />

      <FeaturedClassesSection
        classes={featuredClasses}
        isLoading={isLoading}
        error={errorMessage}
      />

      <LandingFooter
        actions={
          <Link to={primary.to} className={PRIMARY_LINK}>
            {primary.label}
          </Link>
        }
      />
    </div>
  )
}
