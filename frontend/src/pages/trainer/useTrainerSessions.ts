import { useQueries, useQuery } from '@tanstack/react-query'
import { classesApi, schedulesApi } from '@/api'
import { useAuth } from '@/auth'
import type { ClassSchedule, GymClass } from '@/types/api'

const PAGE_SIZE = 100

export type TrainerSession = {
  gymClass: GymClass
  schedule: ClassSchedule
}

export type UseTrainerSessionsResult = {
  sessions: TrainerSession[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Classes and weekly schedules of the logged-in trainer only.
 *
 * The backend has no single "trainer schedules" endpoint yet, so this composes
 * `GET /classes?trainer_id=` with one `GET /class-schedules?class_id=` per class.
 */
export function useTrainerSessions(): UseTrainerSessionsResult {
  const { user } = useAuth()
  const trainerId = user?.id ?? 0

  const classes = useQuery({
    queryKey: ['trainer', trainerId, 'classes'],
    enabled: user !== null,
    queryFn: () => classesApi.list({ trainer_id: trainerId, size: PAGE_SIZE }),
  })

  const classList = classes.data?.items ?? []

  const scheduleQueries = useQueries({
    queries: classList.map((gymClass) => ({
      queryKey: ['trainer', trainerId, 'schedules', gymClass.id],
      queryFn: () => schedulesApi.list({ class_id: gymClass.id, size: PAGE_SIZE }),
    })),
  })

  const sessions: TrainerSession[] = classList.flatMap((gymClass, index) =>
    (scheduleQueries[index]?.data?.items ?? []).map((schedule) => ({ gymClass, schedule })),
  )

  const failedSchedule = scheduleQueries.find((query) => query.isError)

  return {
    sessions,
    isLoading: classes.isLoading || scheduleQueries.some((query) => query.isLoading),
    isError: classes.isError || failedSchedule !== undefined,
    error: classes.error ?? failedSchedule?.error ?? null,
  }
}
