import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { syncCaseStatus } from '@/lib/case-status-sync'

// Records that a structured internal confirmation was requested (US-07 AC1:
// "Sending a confirmation request updates status to Pending internal
// confirmation") — distinct from actually submitting the form (see
// structured-confirmation/route.ts, which clears confirmationRequestedAt).
// Idempotent: re-requesting just refreshes the timestamp rather than erroring.
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data: { confirmationRequestedAt: new Date() } }),
    prisma.caseActionLog.create({ data: { caseId: id, type: 'CONFIRMATION_REQUESTED' } }),
  ])

  const status = await syncCaseStatus(id)
  return NextResponse.json({ ...updated, status: status ?? updated.status })
}
