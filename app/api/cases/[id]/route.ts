import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { syncCasesStatusBatch } from '@/lib/case-status-sync'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({
    where: { id },
    include: { actionLogs: { orderBy: { createdAt: 'desc' } } },
  })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const [synced] = await syncCasesStatusBatch([kase])
  return NextResponse.json(synced)
}
