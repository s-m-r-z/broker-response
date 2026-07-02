import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { verified } = await req.json()

  if (typeof verified !== 'boolean') {
    return NextResponse.json({ error: 'verified must be a boolean' }, { status: 400 })
  }

  const clause = await prisma.lawClause.update({ where: { id }, data: { verified } })
  return NextResponse.json(clause)
}
