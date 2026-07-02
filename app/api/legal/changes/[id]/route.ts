import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action } = await req.json()

  if (action !== 'accept' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "accept" or "reject"' }, { status: 400 })
  }

  const change = await prisma.pendingLawChange.findUnique({ where: { id } })
  if (!change) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (change.status !== 'PENDING') {
    return NextResponse.json({ error: 'Change has already been reviewed' }, { status: 409 })
  }

  if (action === 'accept') {
    await prisma.$transaction([
      prisma.lawClause.update({
        where: { id: change.clauseId },
        data: {
          title: change.proposedTitle ?? undefined,
          citation: change.proposedCitation ?? undefined,
          text: change.proposedText,
          verified: false,
        },
      }),
      prisma.pendingLawChange.update({
        where: { id },
        data: { status: 'ACCEPTED', reviewedAt: new Date() },
      }),
    ])
  } else {
    await prisma.pendingLawChange.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
