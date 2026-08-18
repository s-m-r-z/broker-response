import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const testCases = await prisma.testCase.findMany({ take: 20 })

  if (testCases.length === 0) {
    console.error('No test cases found — run seed-test-cases.ts first.')
    process.exit(1)
  }

  const runs = []

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]
    const startedAt = new Date(Date.now() - (20 - i) * 3600 * 1000)

    if (i % 5 === 4) {
      // Every 5th: FAIL manual run
      runs.push({
        testCaseId: tc.id,
        mode: 'MANUAL',
        status: 'FAIL',
        log: `FAIL: Expected element not found. Step 3 failed — modal did not close after confirmation.`,
        startedAt,
        completedAt: new Date(startedAt.getTime() + 90000),
      })
    } else if (i % 7 === 6) {
      // Every 7th: ERROR automated run
      runs.push({
        testCaseId: tc.id,
        mode: 'AUTOMATED',
        status: 'ERROR',
        log: `ERROR: Playwright timeout after 30s waiting for selector [data-testid="confirm-btn"].\nStack: TimeoutError: page.click: Timeout 30000ms exceeded.`,
        startedAt,
        completedAt: new Date(startedAt.getTime() + 30000),
      })
    } else if (i < 3) {
      // First few: RUNNING (in-flight automated)
      runs.push({
        testCaseId: tc.id,
        mode: 'AUTOMATED',
        status: 'RUNNING',
        log: null,
        startedAt: new Date(Date.now() - 15000),
        completedAt: null,
      })
    } else {
      // Rest: PASS
      const mode = i % 3 === 0 ? 'AUTOMATED' : 'MANUAL'
      runs.push({
        testCaseId: tc.id,
        mode,
        status: 'PASS',
        log: mode === 'AUTOMATED'
          ? `PASS: All assertions passed. Duration: ${800 + i * 37}ms.`
          : `PASS: Manual walkthrough complete. All steps verified.`,
        startedAt,
        completedAt: new Date(startedAt.getTime() + (mode === 'AUTOMATED' ? 800 + i * 37 : 120000)),
      })
    }
  }

  await prisma.testRun.createMany({ data: runs })
  console.log(`Seeded ${runs.length} test runs.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
