import { PrismaClient } from '@prisma/client'
import { TEST_CASES } from '../lib/test-cases-data'

const prisma = new PrismaClient()

async function main() {
  for (const tc of TEST_CASES) {
    await prisma.testCase.upsert({
      where: { tcId: tc.tcId },
      update: {
        section: tc.section,
        userStory: tc.userStory,
        type: tc.type,
        scenario: tc.scenario,
        expected: tc.expected,
        automatable: tc.automatable,
      },
      create: tc,
    })
  }
  console.log(`Seeded ${TEST_CASES.length} test cases.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
