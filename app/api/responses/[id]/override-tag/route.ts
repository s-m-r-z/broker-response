import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { overrideTagSchema } from '@/lib/response-validation'

// Manually overrides a response's classification (US-09) — see
// lib/response-validation.ts for why this is a correction logged for the
// external classification pipeline, not a retraining signal this app acts
// on itself. Always allowed, even to the same tag, so re-affirming a
// classification is still captured in the log.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = overrideTagSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const response = await prisma.brokerResponse.findUnique({ where: { id } })
  if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await prisma.$transaction([
    prisma.brokerResponse.update({ where: { id }, data: { tag: parsed.data.tag } }),
    prisma.actionLog.create({
      data: {
        responseId: id,
        type: 'CLASSIFICATION_OVERRIDDEN',
        note: `${response.tag} → ${parsed.data.tag}${parsed.data.note ? `: ${parsed.data.note}` : ''}`,
      },
    }),
  ])

  return NextResponse.json(updated)
}
