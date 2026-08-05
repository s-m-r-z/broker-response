// Recomputes and, if changed, persists+logs a case's four-state status
// (US-07/US-23). Called after any mutation that could affect it (evidence
// confirmation, closure, confirmation request/resolution, stage advance)
// and on read (GET routes) to catch the passive, time-based transition into
// DEADLINE_APPROACHING that no user action triggers directly.
import { prisma } from './db'
import { deriveCaseStatus, type CaseStatus } from './case-tracker'
import { CASE_STATUS_CONFIG } from './constants'
import type { Case } from '@prisma/client'

function statusChangeNote(from: string, to: CaseStatus): string {
  const fromLabel = CASE_STATUS_CONFIG[from as CaseStatus]?.label ?? from
  return `${fromLabel} → ${CASE_STATUS_CONFIG[to].label}`
}

export async function syncCaseStatus(caseId: string): Promise<string | null> {
  const kase = await prisma.case.findUnique({ where: { id: caseId } })
  if (!kase) return null

  const nextStatus = deriveCaseStatus(kase)
  if (nextStatus === kase.status) return kase.status

  await prisma.$transaction([
    prisma.case.update({ where: { id: caseId }, data: { status: nextStatus } }),
    prisma.caseActionLog.create({
      data: { caseId, type: 'STATUS_CHANGED', note: statusChangeNote(kase.status, nextStatus) },
    }),
  ])
  return nextStatus
}

// Batch variant for list endpoints — operates on rows already fetched
// (avoids an N+1 refetch), persists+logs only the ones that actually
// changed, and returns the same array with status corrected in place so
// the response is fresh even for cases updated by this same call.
export async function syncCasesStatusBatch<T extends Case>(cases: T[]): Promise<T[]> {
  const changed = cases
    .map((kase) => ({ kase, nextStatus: deriveCaseStatus(kase) }))
    .filter(({ kase, nextStatus }) => nextStatus !== kase.status)

  if (changed.length > 0) {
    await prisma.$transaction(
      changed.flatMap(({ kase, nextStatus }) => [
        prisma.case.update({ where: { id: kase.id }, data: { status: nextStatus } }),
        prisma.caseActionLog.create({
          data: { caseId: kase.id, type: 'STATUS_CHANGED', note: statusChangeNote(kase.status, nextStatus) },
        }),
      ])
    )
  }

  const nextStatusById = new Map(changed.map(({ kase, nextStatus }) => [kase.id, nextStatus]))
  return cases.map((kase) => (nextStatusById.has(kase.id) ? { ...kase, status: nextStatusById.get(kase.id)! } : kase))
}
