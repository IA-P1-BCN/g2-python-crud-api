import type { IconName } from '@/components/ui/atoms/Icon'

export type PlanBenefit = {
  icon: IconName
  label: string
}

/**
 * What every gym plan includes.
 *
 * The API only stores the name, description, price and duration of a plan, so the
 * benefits are the same for all of them and live here, shared by the member pages.
 */
export const PLAN_BENEFITS: PlanBenefit[] = [
  { icon: 'dumbbell', label: 'Acceso a todas las clases dirigidas' },
  { icon: 'calendar', label: 'Reserva online de tus sesiones' },
  { icon: 'check', label: 'Sin permanencia' },
]
