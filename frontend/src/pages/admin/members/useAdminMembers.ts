import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { membershipPlansApi, membershipsApi, paymentsApi, usersApi } from '@/api'
import type { MemberListEntry } from '@/components/ui/organisms/MembersList'
import type { Membership, Payment, User } from '@/types/api'

const PAGE_SIZE = 10
const DETAIL_SIZE = 100

export type AdminMember = MemberListEntry & { user: User }

export type UseAdminMembersParams = {
  page: number
  search?: string
  isActive?: boolean
}

export type UseAdminMembersResult = {
  members: AdminMember[]
  total: number
  pages: number
  isLoading: boolean
  isError: boolean
  error: unknown
}

function currentMembership(memberships: Membership[]): Membership | undefined {
  const active = memberships.find((membership) => membership.status === 'active')
  if (active) return active
  return [...memberships].sort((a, b) => b.end_date.localeCompare(a.end_date))[0]
}

function latestPayment(payments: Payment[]): Payment | undefined {
  return [...payments].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
}

/**
 * Members page (server-side search and pagination) enriched with each member's
 * current plan, membership state and last payment.
 *
 * The backend list endpoint does not join memberships/payments, so those are
 * composed per member with `GET /users/{id}/memberships` and
 * `GET /payments?user_id=`.
 */
export function useAdminMembers({
  page,
  search,
  isActive,
}: UseAdminMembersParams): UseAdminMembersResult {
  const members = useQuery({
    queryKey: ['admin-members', { page, search, isActive }],
    queryFn: () =>
      usersApi.list({
        role: 'member',
        page,
        size: PAGE_SIZE,
        search: search || undefined,
        is_active: isActive,
      }),
    placeholderData: keepPreviousData,
  })

  const plans = useQuery({
    queryKey: ['membership-plans', 'all'],
    queryFn: () => membershipPlansApi.list({ size: DETAIL_SIZE }),
  })

  const memberList = members.data?.items ?? []

  const summaries = useQueries({
    queries: memberList.map((member) => ({
      queryKey: ['admin-member', member.id, 'summary'],
      queryFn: async () => {
        const [memberships, payments] = await Promise.all([
          membershipsApi.listForUser(member.id, { size: DETAIL_SIZE }),
          paymentsApi.list({ user_id: member.id, size: DETAIL_SIZE }),
        ])
        return { memberships: memberships.items, payments: payments.items }
      },
    })),
  })

  const planNames = new Map((plans.data?.items ?? []).map((plan) => [plan.id, plan.name]))

  const rows: AdminMember[] = memberList.map((member, index) => {
    const summary = summaries[index]?.data
    const membership = summary ? currentMembership(summary.memberships) : undefined
    const payment = summary ? latestPayment(summary.payments) : undefined

    return {
      id: member.id,
      name: member.full_name,
      email: member.email,
      planName: membership
        ? (planNames.get(membership.plan_id) ?? `Plan #${membership.plan_id}`)
        : null,
      membershipStatus: membership?.status ?? null,
      lastPayment: payment
        ? { amountCents: payment.amount_cents, date: payment.created_at, status: payment.status }
        : null,
      user: member,
    }
  })

  const failedSummary = summaries.find((summary) => summary.isError)

  return {
    members: rows,
    total: members.data?.total ?? 0,
    pages: members.data?.pages ?? 1,
    isLoading: members.isLoading || plans.isLoading || summaries.some((s) => s.isLoading),
    isError: members.isError || plans.isError || failedSummary !== undefined,
    error: members.error ?? plans.error ?? failedSummary?.error ?? null,
  }
}
