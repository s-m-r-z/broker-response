import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLegalAiProvider } from '@/lib/legal-ai'

// Manual "check for updates" trigger. Asks the configured provider to
// re-derive each clause and, if it differs, files a PendingLawChange for
// someone to accept or reject — the live clause is never edited directly.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const regime = await prisma.lawRegime.findUnique({ where: { id }, include: { clauses: true } })
  if (!regime) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ai = getLegalAiProvider()
  let proposedCount = 0

  for (const clause of regime.clauses) {
    const result = await ai.recheckClause({
      country: regime.country,
      state: regime.state,
      regimeName: regime.name,
      clause: { category: clause.category, title: clause.title, citation: clause.citation, text: clause.text },
    })

    if (!result.changed) continue

    // Supersede any earlier unreviewed proposal for this clause.
    await prisma.pendingLawChange.updateMany({
      where: { clauseId: clause.id, status: 'PENDING' },
      data: { status: 'REJECTED', reviewedAt: new Date() },
    })

    await prisma.pendingLawChange.create({
      data: {
        clauseId: clause.id,
        proposedTitle: result.proposedTitle ?? null,
        proposedCitation: result.proposedCitation ?? null,
        proposedText: result.proposedText ?? clause.text,
        changeSummary: result.changeSummary ?? 'Recheck flagged a possible change.',
      },
    })
    proposedCount++
  }

  await prisma.lawRegime.update({ where: { id }, data: { lastCheckedAt: new Date() } })

  return NextResponse.json({ proposedCount })
}
