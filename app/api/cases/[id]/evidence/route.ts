import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { confirmEvidenceSchema } from '@/lib/case-validation'
import { assertConfirmable, assertNotClosed, EVIDENCE_ITEM_FIELD, type EvidenceItem } from '@/lib/case-tracker'
import { EVIDENCE_ITEM_CONFIG } from '@/lib/constants'
import { syncCaseStatus } from '@/lib/case-status-sync'

// Confirms one evidence-checklist item. Each item is immutable once
// confirmed (mirrors confirm-jurisdiction/confirm-authority) — see
// lib/case-tracker.ts assertConfirmable. retentionException's note is
// stored on evidenceRetentionNote since the confirmed value itself matters,
// not just the timestamp.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = confirmEvidenceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }
  const { item, note } = parsed.data

  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const closedCheck = assertNotClosed(kase.closedAt)
  if (!closedCheck.ok) return NextResponse.json({ error: closedCheck.error }, { status: 409 })

  const field = EVIDENCE_ITEM_FIELD[item as EvidenceItem] as
    | 'evidenceRequestConfirmedAt'
    | 'evidenceIdentityConfirmedAt'
    | 'evidenceSystemsConfirmedAt'
    | 'evidenceReplyConfirmedAt'
    | 'evidenceRetentionConfirmedAt'

  const check = assertConfirmable(kase[field], EVIDENCE_ITEM_CONFIG[item as EvidenceItem].label)
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({
      where: { id },
      data: {
        [field]: new Date(),
        ...(item === 'retentionException' ? { evidenceRetentionNote: note } : {}),
        // Evidence progress resolves an outstanding confirmation request
        // (US-07) even if it wasn't submitted through the structured form.
        confirmationRequestedAt: null,
      },
    }),
    prisma.caseActionLog.create({
      data: {
        caseId: id,
        type: 'EVIDENCE_CONFIRMED',
        note: `${EVIDENCE_ITEM_CONFIG[item as EvidenceItem].label} confirmed${note ? `: ${note}` : ''}`,
      },
    }),
  ])

  const status = await syncCaseStatus(id)
  return NextResponse.json({ ...updated, status: status ?? updated.status })
}
