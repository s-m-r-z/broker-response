import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { approveDraftSchema } from '@/lib/case-validation'

// Snapshots the current draftReply as approved (US-25). Not immutable —
// re-approving after an edit is expected, so this always overwrites the
// prior snapshot rather than rejecting a second call. The filing gate
// (lib/case-tracker.ts assertDraftApprovedForFiling, checked in
// app/api/cases/[id]/advance/route.ts) compares this snapshot against the
// live draftReply at the moment of filing, not at approval time.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = approveDraftSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!kase.draftReply || !kase.draftReply.trim()) {
    return NextResponse.json({ error: 'Cannot approve an empty draft.' }, { status: 409 })
  }

  const [updated] = await prisma.$transaction([
    prisma.case.update({
      where: { id },
      data: {
        approvedDraftText: kase.draftReply,
        approvedBy: parsed.data.reviewerName,
        approvedAt: new Date(),
      },
    }),
    prisma.caseActionLog.create({
      data: { caseId: id, type: 'DRAFT_APPROVED', note: `Approved by ${parsed.data.reviewerName}` },
    }),
  ])

  return NextResponse.json(updated)
}
