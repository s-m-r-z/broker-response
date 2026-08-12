import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assertConfirmable, assertNotClosed } from '@/lib/case-tracker'

// Locks authorityConfirmedAt. Immutable once set — a case cannot reach
// complaint_filed without this (enforced in lib/case-tracker.ts).
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const closedCheck = assertNotClosed(kase.closedAt)
  if (!closedCheck.ok) return NextResponse.json({ error: closedCheck.error }, { status: 409 })

  const check = assertConfirmable(kase.authorityConfirmedAt, 'Authority')
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data: { authorityConfirmedAt: new Date() } }),
    prisma.caseActionLog.create({ data: { caseId: id, type: 'AUTHORITY_CONFIRMED' } }),
  ])

  return NextResponse.json(updated)
}
