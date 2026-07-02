import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const actions = await prisma.actionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { response: { select: { id: true, brokerName: true, tag: true } } },
  })
  return NextResponse.json(actions)
}
