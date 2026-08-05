import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BUCKET_TAGS, STAKEHOLDER_CONFIG } from '@/lib/constants'
import { type Bucket, type Tag, type Stakeholder } from '@/lib/types'

export async function GET() {
  const [rows, assigneeRows] = await Promise.all([
    prisma.brokerResponse.groupBy({
      by: ['tag'],
      _count: { _all: true },
    }),
    prisma.brokerResponse.groupBy({
      by: ['assignedTo'],
      where: { assignedTo: { not: null } },
      _count: { _all: true },
    }),
  ])

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

  // Zero-filled so every stakeholder in STAKEHOLDER_CONFIG always has a key,
  // even with no responses currently assigned to them — mirrors how byTag's
  // consumers (Sidebar) only render a count badge when > 0, but callers can
  // rely on the key existing.
  const byAssignee = Object.fromEntries(
    (Object.keys(STAKEHOLDER_CONFIG) as Stakeholder[]).map((s) => [
      s,
      assigneeRows.find((r) => r.assignedTo === s)?._count._all ?? 0,
    ])
  ) as Record<Stakeholder, number>

  return NextResponse.json({ byTag, byBucket, byAssignee })
}
