import { PrismaClient } from '@prisma/client'
import { getLegalAiProvider } from '../lib/legal-ai'

const prisma = new PrismaClient()
const ai = getLegalAiProvider()

const JURISDICTIONS: { country: string; state?: string; regimeName: string }[] = [
  { country: 'European Union', regimeName: 'GDPR' },
  { country: 'United States', state: 'California', regimeName: 'CCPA/CPRA' },
  { country: 'United Kingdom', regimeName: 'UK GDPR' },
  { country: 'Canada', regimeName: 'PIPEDA' },
  { country: 'Brazil', regimeName: 'LGPD' },
]

async function main() {
  console.log('Seeding legal workbook…')

  await prisma.pendingLawChange.deleteMany()
  await prisma.lawClause.deleteMany()
  await prisma.lawRegime.deleteMany()

  for (const j of JURISDICTIONS) {
    const generated = await ai.generateRegime(j)

    await prisma.lawRegime.create({
      data: {
        country: j.country,
        state: j.state,
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
    })
  }

  const count = await prisma.lawRegime.count()
  console.log(`Done — ${count} regimes seeded.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
