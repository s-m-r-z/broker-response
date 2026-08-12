import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Records the outcome of a human-run guided walkthrough (see
// components/test-cases/manual-run-panel.tsx) — there's no RUNNING state
// here since the tester has already finished the steps by the time this is
// called.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  if (status !== 'PASS' && status !== 'FAIL') {
    return NextResponse.json({ error: 'status must be PASS or FAIL' }, { status: 400 })
  }

  const testCase = await prisma.testCase.findUnique({ where: { id } })
  if (!testCase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const run = await prisma.testRun.create({
    data: { testCaseId: id, mode: 'MANUAL', status, completedAt: new Date() },
  })
  return NextResponse.json(run)
}
