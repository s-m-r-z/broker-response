import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLegalAiProvider } from '@/lib/legal-ai'

export async function GET() {
  const regimes = await prisma.lawRegime.findMany({
    include: {
      clauses: {
        include: { pendingChanges: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(regimes)
}

export async function POST(req: NextRequest) {
  try {
    const { country, state, regimeName } = await req.json()
    if (!country || !regimeName) {
      return NextResponse.json({ error: 'Missing country or regimeName' }, { status: 400 })
    }

    const ai = getLegalAiProvider()
    const generated = await ai.generateRegime({ country, state, regimeName })

    const regime = await prisma.lawRegime.create({
      data: {
        country,
        state: state ?? null,
        name: generated.name,
        description: generated.description,
        sourceModel: ai.modelLabel,
        aiGenerated: true,
        lastCheckedAt: new Date(),
        clauses: {
          create: generated.clauses.map((c) => ({
            category: c.category,
            title: c.title,
            citation: c.citation,
            text: c.text,
            sourceUrl: c.sourceUrl,
            aiGenerated: true,
            verified: false,
          })),
        },
      },
      include: { clauses: { include: { pendingChanges: true } } },
    })

    return NextResponse.json(regime, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to generate regime' }, { status: 500 })
  }
}
