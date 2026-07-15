import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Merges ActionLog (BrokerResponse history) and CaseActionLog (Case history)
// into one time-ordered feed for Home Overview's Recent Activity — each side
// is fetched independently (its own take: 8) since either could dominate the
// merged top 8, then combined and re-sorted.
export async function GET() {
  const [responseActions, caseActions] = await Promise.all([
    prisma.actionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { response: { select: { id: true, brokerName: true, tag: true } } },
    }),
    prisma.caseActionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { case: { select: { id: true, brokerName: true, enforcementStage: true } } },
    }),
  ])

  const merged = [
    ...responseActions.map((a) => ({ ...a, source: 'response' as const })),
    ...caseActions.map((a) => ({ ...a, source: 'case' as const })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return NextResponse.json(merged)
}
