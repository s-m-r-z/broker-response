import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { assignStakeholderSchema } from '@/lib/response-validation'

// Assigns a response to a stakeholder (Product Manager / Engineering) for
// follow-up. Deliberately independent of BrokerResponse.status — status is
// only ever mutated by app/api/actions/route.ts's Escalate/Resolve/Re-send
// and app/api/email/route.ts's Email Sent. Logs an ActionLog row (type
// ASSIGNED, assignedTo set) in the same transaction as the update, mirroring
// app/api/cases/[id]/advance/route.ts's shape. Re-assigning to the same
// stakeholder already held is allowed — always appends a new log entry.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = assignStakeholderSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const response = await prisma.brokerResponse.findUnique({ where: { id } })
  if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await prisma.$transaction([
    prisma.brokerResponse.update({ where: { id }, data: { assignedTo: parsed.data.assignedTo } }),
    prisma.actionLog.create({
      data: { responseId: id, type: 'ASSIGNED', assignedTo: parsed.data.assignedTo, note: parsed.data.note ?? null },
    }),
  ])

  return NextResponse.json(updated)
}
