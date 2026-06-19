import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tag = searchParams.get('tag')
  const tags = searchParams.get('tags')
  const search = searchParams.get('search')
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 50)

  const where: Record<string, unknown> = {}

  if (tag) {
    where.tag = tag
  } else if (tags) {
    where.tag = { in: tags.split(',') }
  }

  if (search) {
    where.OR = [
      { brokerName: { contains: search } },
      { brokerEmail: { contains: search } },
      { responseContent: { contains: search } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.brokerResponse.findMany({
      where,
      include: { actions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.brokerResponse.count({ where }),
  ])

  return NextResponse.json({ data, total, page, pageSize })
}
