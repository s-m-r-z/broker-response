import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TEST_RUNNERS } from '@/lib/test-runner/registry'
import { withAuthedPage } from '@/lib/test-runner/browser'

// Drives the actual app with Playwright (see lib/test-runner) — only valid
// for test cases whose tcId has a registered runner. Manual-only cases go
// through /api/test-cases/[id]/manual-result instead.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const testCase = await prisma.testCase.findUnique({ where: { id } })
  if (!testCase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const runner = TEST_RUNNERS[testCase.tcId]
  if (!testCase.automatable || !runner) {
    return NextResponse.json({ error: 'This test case is manual-only and has no automated runner.' }, { status: 409 })
  }

  const run = await prisma.testRun.create({
    data: { testCaseId: testCase.id, mode: 'AUTOMATED', status: 'RUNNING' },
  })

  try {
    const result = await withAuthedPage((page) => runner(page))
    const updated = await prisma.testRun.update({
      where: { id: run.id },
      data: { status: result.status, log: result.log, completedAt: new Date() },
    })
    return NextResponse.json(updated)
  } catch (e) {
    const updated = await prisma.testRun.update({
      where: { id: run.id },
      data: {
        status: 'ERROR',
        log: e instanceof Error ? e.message : 'Unknown error while running the test.',
        completedAt: new Date(),
      },
    })
    return NextResponse.json(updated, { status: 500 })
  }
}
