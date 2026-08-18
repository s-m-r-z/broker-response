import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const clauses = await prisma.lawClause.findMany({ take: 6 })

  if (clauses.length === 0) {
    console.error('No law clauses found — run seed-legal.ts first.')
    process.exit(1)
  }

  const changes = [
    {
      clauseId: clauses[0].id,
      proposedTitle: clauses[0].title,
      proposedCitation: clauses[0].citation,
      proposedText: clauses[0].text + ' [Updated: Amended by the Digital Rights Amendment Act 2024 to include AI-generated data profiles within scope of the right to erasure.]',
      changeSummary: 'AI recheck flagged an extension of scope to AI-generated data profiles following the Digital Rights Amendment Act 2024.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      clauseId: clauses[1].id,
      proposedTitle: clauses[1].title,
      proposedCitation: clauses[1].citation,
      proposedText: clauses[1].text + ' [Updated: Response deadline reduced from 30 to 21 days following Q3 2024 regulatory guidance.]',
      changeSummary: 'Deadline reduced from 30 to 21 days per updated regulatory guidance issued Q3 2024.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
    {
      clauseId: clauses[2].id,
      proposedTitle: clauses[2].title,
      proposedCitation: clauses[2].citation,
      proposedText: clauses[2].text + ' [Updated: Biometric verification now explicitly excluded as an acceptable form of identity verification.]',
      changeSummary: 'Biometric verification explicitly excluded from acceptable identity verification methods following ICO guidance update.',
      status: 'ACCEPTED',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      reviewedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    },
    {
      clauseId: clauses[3].id,
      proposedTitle: clauses[3].title,
      proposedCitation: clauses[3].citation,
      proposedText: clauses[3].text + ' [Proposed change: Expand legitimate interest exemption to include fraud prevention use cases.]',
      changeSummary: 'Proposed broadening of legitimate interest exemption — flagged for legal review as it contradicts prior enforcement decisions.',
      status: 'REJECTED',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      reviewedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000),
    },
    {
      clauseId: clauses[4].id,
      proposedTitle: clauses[4].title,
      proposedCitation: clauses[4].citation,
      proposedText: clauses[4].text + ' [Updated: Maximum fine increased to €35 million or 4% of global turnover following legislative amendment.]',
      changeSummary: 'Maximum penalty ceiling raised to €35M following parliamentary amendment ratified October 2024.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  ]

  await prisma.pendingLawChange.createMany({ data: changes })
  console.log(`Seeded ${changes.length} pending law changes.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
