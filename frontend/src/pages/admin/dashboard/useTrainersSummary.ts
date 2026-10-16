import { useQueries, useQuery } from '@tanstack/react-query'
import { classesApi, schedulesApi, usersApi } from '@/api'

const PAGE_SIZE = 100

export type TrainerSummary = {
  id: number
  name: string
  /** Weekly scheduled sessions (from the trainer's class schedules). */
  sessions: number
}

export type UseTrainersSummaryResult = {
  trainers: TrainerSummary[]
  isLoading: boolean
  isError: boolean
  error: unknown
}

/**
 * Active trainers with their number of weekly scheduled sessions.
 *
 * The backend has no trainers summary endpoint, so this composes
 * `GET /users?role=trainer&is_active=true` with one `GET /classes?trainer_id=`
 * per trainer and one `GET /class-schedules?class_id=` per class.
 */
export function useTrainersSummary(): UseTrainersSummaryResult {
  const users = useQuery({
    queryKey: ['admin', 'trainers', 'active'],
    queryFn: () => usersApi.list({ role: 'trainer', is_active: true, size: PAGE_SIZE }),
  })

  const trainerList = users.data?.items ?? []

  const classQueries = useQueries({
    queries: trainerList.map((trainer) => ({
      queryKey: ['admin', 'trainers', trainer.id, 'classes'],
      queryFn: () => classesApi.list({ trainer_id: trainer.id, size: PAGE_SIZE }),
    })),
  })

  const classesPerTrainer = classQueries.map((query) => query.data?.items ?? [])
  const flatClasses = classesPerTrainer.flat()

  const scheduleQueries = useQueries({
    queries: flatClasses.map((gymClass) => ({
      queryKey: ['admin', 'trainers', 'schedules', gymClass.id],
      queryFn: () => schedulesApi.list({ class_id: gymClass.id, size: PAGE_SIZE }),
    })),
  })

  const sessionsPerClass = flatClasses.map(
    (_, index) => scheduleQueries[index]?.data?.items.length ?? 0,
  )

  let cursor = 0
  const trainers: TrainerSummary[] = trainerList.map((trainer, index) => {
    const count = classesPerTrainer[index].length
    const sessions = sessionsPerClass
      .slice(cursor, cursor + count)
      .reduce((total, value) => total + value, 0)
    cursor += count
    return { id: trainer.id, name: trainer.full_name, sessions }
  })

  const failedClass = classQueries.find((query) => query.isError)
  const failedSchedule = scheduleQueries.find((query) => query.isError)

  return {
    trainers,
    isLoading:
      users.isLoading ||
      classQueries.some((query) => query.isLoading) ||
      scheduleQueries.some((query) => query.isLoading),
    isError: users.isError || failedClass !== undefined || failedSchedule !== undefined,
    error: users.error ?? failedClass?.error ?? failedSchedule?.error ?? null,
  }
}
