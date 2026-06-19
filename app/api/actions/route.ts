import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const ACTION_TO_STATUS: Record<string, string> = {
  RESOLVED: 'RESOLVED',
  ESCALATED_TO_LEGAL: 'ESCALATED_TO_LEGAL',
  RE_SENT: 'RE_SENT',
  IN_PROGRESS: 'IN_PROGRESS',
}

const ACTION_TO_LOG_TYPE: Record<string, string> = {
  RESOLVED: 'MARKED_RESOLVED',
  ESCALATED_TO_LEGAL: 'ESCALATED_TO_LEGAL',
  RE_SENT: 'RE_SENT',
  IN_PROGRESS: 'NOTE_ADDED',
}

export async function POST(req: NextRequest) {
  try {
    const { responseId, action, note } = await req.json()

    if (!responseId || !action) {
      return NextResponse.json({ error: 'Missing responseId or action' }, { status: 400 })
    }

    const newStatus = ACTION_TO_STATUS[action]
    const logType = ACTION_TO_LOG_TYPE[action]

    await Promise.all([
      newStatus
        ? prisma.brokerResponse.update({
            where: { id: responseId },
            data: { status: newStatus },
          })
        : Promise.resolve(),
      prisma.actionLog.create({
        data: {
          responseId,
          type: logType ?? action,
          note: note ?? null,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to record action' }, { status: 500 })
  }
}
