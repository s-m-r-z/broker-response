import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BUCKET_TAGS } from '@/lib/constants'
import { type Bucket, type Tag } from '@/lib/types'

export async function GET() {
  const rows = await prisma.brokerResponse.groupBy({
    by: ['tag'],
    _count: { _all: true },
  })

  const byTag = Object.fromEntries(
    rows.map(({ tag, _count }) => [tag as Tag, _count._all])
  ) as Record<Tag, number>

  const byBucket = Object.fromEntries(
    (Object.entries(BUCKET_TAGS) as [Bucket, Tag[]][]).map(([bucket, tags]) => [
      bucket,
      tags.reduce((sum, tag) => sum + (byTag[tag] ?? 0), 0),
    ])
  ) as Record<Bucket, number>

  // 'all' bucket is total of everything
  byBucket.all = rows.reduce((sum, r) => sum + r._count._all, 0)

  return NextResponse.json({ byTag, byBucket })
}
