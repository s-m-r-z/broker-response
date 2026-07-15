import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assertConfirmable } from '@/lib/case-tracker'

// Locks jurisdictionConfirmedAt. Immutable once set — a case cannot reach
// complaint_eligible without this (enforced in lib/case-tracker.ts).
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const check = assertConfirmable(kase.jurisdictionConfirmedAt, 'Jurisdiction')
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data: { jurisdictionConfirmedAt: new Date() } }),
    prisma.caseActionLog.create({ data: { caseId: id, type: 'JURISDICTION_CONFIRMED' } }),
  ])

  return NextResponse.json(updated)
}
