import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const response = await prisma.brokerResponse.findUnique({
    where: { id: params.id },
    include: { actions: { orderBy: { createdAt: 'desc' } } },
  })
  if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(response)
}
