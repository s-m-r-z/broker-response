import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const testCases = await prisma.testCase.findMany({
    orderBy: { tcId: 'asc' },
    include: { runs: { orderBy: { startedAt: 'desc' }, take: 1 } },
  })
  return NextResponse.json(testCases)
}
