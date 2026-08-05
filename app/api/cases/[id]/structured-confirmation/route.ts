import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { structuredConfirmationSchema } from '@/lib/case-validation'
import { assertConfirmable } from '@/lib/case-tracker'
import { Prisma } from '@prisma/client'

// The structured internal confirmation form (US-18): one submission with
// all four required fields (system, action, date, retention exception)
// batch-confirms the matching evidence-checklist items (US-19) instead of
// requiring three separate follow-up asks. Items already confirmed
// individually are left untouched rather than erroring the whole batch —
// the structured-confirmation event itself is always logged regardless, so
// the full set of values submitted is never lost even when some items were
// already on record.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = structuredConfirmationSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }
  const { systemName, actionTaken, date, retentionException, responderName } = parsed.data

  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const data: Prisma.CaseUpdateInput = {}

  if (assertConfirmable(kase.evidenceSystemsConfirmedAt, 'Systems confirmation').ok) {
    data.evidenceSystemsConfirmedAt = now
  }
  if (assertConfirmable(kase.evidenceReplyConfirmedAt, 'Broker reply').ok) {
    data.evidenceReplyConfirmedAt = now
  }
  if (assertConfirmable(kase.evidenceRetentionConfirmedAt, 'Retention exception').ok) {
    data.evidenceRetentionConfirmedAt = now
    data.evidenceRetentionNote = retentionException
  }

  const note = `System: ${systemName} · Action: ${actionTaken} · Date: ${date} · Retention exception: ${retentionException} (responder: ${responderName})`

  const [updated] = await prisma.$transaction([
    prisma.case.update({ where: { id }, data }),
    prisma.caseActionLog.create({ data: { caseId: id, type: 'STRUCTURED_CONFIRMATION', note } }),
  ])

  return NextResponse.json(updated)
}
