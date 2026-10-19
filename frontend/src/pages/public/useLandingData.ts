import { useQueries, useQuery } from '@tanstack/react-query'
import { classesApi, membershipPlansApi, schedulesApi } from '@/api'
import type { FeaturedClassSummary } from '@/components/ui/organisms/FeaturedClassesSection'
import type { PlanSummary } from '@/components/ui/organisms/PlansSection'
import { dayLabel, formatTime } from '@/lib/format'
import type { ClassSchedule } from '@/types/api'

const FEATURED_SIZE = 6
const LIST_SIZE = 100

export type UseLandingDataResult = {
  plans: PlanSummary[]
  featuredClasses: FeaturedClassSummary[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

function formatSchedule(schedule: ClassSchedule): string {
  const start = formatTime(schedule.start_time)
  const end = formatTime(schedule.end_time)
  return `${dayLabel(schedule.day_of_week)} ${start} – ${end}`
}

/**
 * Public landing data: active plans and featured classes with their first schedule.
 *
 * Uses public endpoints (no token). Trainer names are not shown: `/users` is staff-only
 * and there is no public trainer endpoint yet.
 */
export function useLandingData(): UseLandingDataResult {
  const plans = useQuery({
    queryKey: ['public', 'plans'],
    queryFn: () => membershipPlansApi.list({ active_only: true, size: LIST_SIZE }),
  })

  const classes = useQuery({
    queryKey: ['public', 'featured-classes'],
    queryFn: () => classesApi.list({ active_only: true, size: FEATURED_SIZE }),
  })

  const classList = classes.data?.items ?? []

  const schedules = useQueries({
    queries: classList.map((gymClass) => ({
      queryKey: ['public', 'class-schedule', gymClass.id],
      queryFn: () => schedulesApi.list({ class_id: gymClass.id, size: 1 }),
    })),
  })

  const planList: PlanSummary[] = (plans.data?.items ?? []).map((plan) => ({
    id: plan.id,
    name: plan.name,
    priceCents: plan.price_cents,
    durationDays: plan.duration_days,
    description: plan.description,
  }))

  const featuredClasses: FeaturedClassSummary[] = classList.map((gymClass, index) => {
    const schedule = schedules[index]?.data?.items[0]
    return {
      id: gymClass.id,
      name: gymClass.name,
      capacity: gymClass.capacity,
      schedule: schedule ? formatSchedule(schedule) : 'Horario por confirmar',
    }
  })

  const failedSchedule = schedules.find((query) => query.isError)

  return {
    plans: planList,
    featuredClasses,
    isLoading: plans.isLoading || classes.isLoading || schedules.some((query) => query.isLoading),
    isError: plans.isError || classes.isError || failedSchedule !== undefined,
    error: plans.error ?? classes.error ?? failedSchedule?.error ?? null,
  }
}
