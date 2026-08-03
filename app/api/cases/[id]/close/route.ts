import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assertCanClose } from '@/lib/case-tracker'

// Closes a case — blocked unless every evidence item is confirmed (US-21).
// Like confirm-jurisdiction/confirm-authority, closedAt is immutable once
// set (assertCanClose rejects a case that's already closed).
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const check = assertCanClose(kase)
  if (!check.ok) {
    return NextResponse.json({ error: check.error, missing: check.missing }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data: { closedAt: new Date() } }),
    prisma.caseActionLog.create({ data: { caseId: id, type: 'CASE_CLOSED' } }),
  ])

  return NextResponse.json(updated)
}
