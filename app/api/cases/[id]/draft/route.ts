import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { saveDraftSchema } from '@/lib/case-validation'

// Saves the draft reply body and its insertion provenance log. No
// immutability guard here — unlike evidence items or confirmations, a
// draft is expected to be edited repeatedly before it's approved (see
// approve-draft/route.ts) and filed.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = saveDraftSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.case.update({
    where: { id },
    data: {
      draftReply: parsed.data.draftReply,
      draftInsertions: parsed.data.draftInsertions ? JSON.stringify(parsed.data.draftInsertions) : kase.draftInsertions,
    },
  })

  return NextResponse.json(updated)
}
