import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { advanceCaseSchema } from '@/lib/case-validation'
import { canTransitionStage, getNextStage, isEnforcementStage } from '@/lib/case-tracker'

// Advances a case to the next stage in ENFORCEMENT_STAGES order. The client
// never supplies a target stage — the server always computes it from the
// stored enforcementStage, so there's no way to request a skip-ahead
// transition. Logs a CaseActionLog row (type STAGE_ADVANCED) alongside the
// update, in the same transaction, mirroring confirm-jurisdiction/route.ts's
// 404 -> business-rule check -> update shape.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = advanceCaseSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!isEnforcementStage(kase.enforcementStage)) {
    return NextResponse.json({ error: `Unknown enforcement stage: ${kase.enforcementStage}` }, { status: 500 })
  }

  const nextStage = getNextStage(kase.enforcementStage)
  if (!nextStage) {
    return NextResponse.json(
      { error: 'Case has completed the enforcement pipeline; no further action available.' },
      { status: 409 }
    )
  }

  const check = canTransitionStage({
    currentStage: kase.enforcementStage,
    targetStage: nextStage,
    jurisdictionConfirmedAt: kase.jurisdictionConfirmedAt,
    authorityConfirmedAt: kase.authorityConfirmedAt,
    draftReply: kase.draftReply,
    approvedDraftText: kase.approvedDraftText,
  })
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data: { enforcementStage: nextStage } }),
    prisma.caseActionLog.create({
      data: { caseId: id, type: 'STAGE_ADVANCED', stage: nextStage, note: parsed.data.note ?? null },
    }),
  ])

  return NextResponse.json(updated)
}
