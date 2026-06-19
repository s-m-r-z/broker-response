import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { responseId, to, subject, body } = await req.json()

    if (!responseId || !to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await sendEmail({ to, subject, body })

    await prisma.actionLog.create({
      data: {
        responseId,
        type: 'EMAIL_SENT',
        emailTo: to,
        emailSubject: subject,
        emailBody: body,
      },
    })

    await prisma.brokerResponse.update({
      where: { id: responseId },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
