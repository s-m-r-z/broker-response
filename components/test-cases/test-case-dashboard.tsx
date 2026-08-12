'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { type TestCase } from '@/lib/types'
import { NavRail } from '../nav-rail'
import { TestCaseRow } from './test-case-row'
import { ManualRunPanel } from './manual-run-panel'

// Section order mirrors docs/test-plan.md / the Miro board — TestCase.section
// strings sort correctly as-is (they're prefixed "01 …" through "06 …").
function groupBySection(testCases: TestCase[]): [string, TestCase[]][] {
  const bySection = new Map<string, TestCase[]>()
  for (const tc of testCases) {
    const list = bySection.get(tc.section) ?? []
    list.push(tc)
    bySection.set(tc.section, list)
  }
  return [...bySection.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export function TestCaseDashboard() {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [manualTarget, setManualTarget] = useState<TestCase | null>(null)

  const fetchTestCases = useCallback(async () => {
    const res = await fetch('/api/test-cases')
    if (res.ok) setTestCases(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTestCases()
  }, [fetchTestCases])

  async function handleStart(testCase: TestCase) {
    if (!testCase.automatable) {
      setManualTarget(testCase)
      return
    }
    setRunningId(testCase.id)
    try {
      await fetch(`/api/test-cases/${testCase.id}/run`, { method: 'POST' })
    } finally {
      setRunningId(null)
      await fetchTestCases()
    }
  }

  async function handleManualResult(status: 'PASS' | 'FAIL') {
    if (!manualTarget) return
    await fetch(`/api/test-cases/${manualTarget.id}/manual-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setManualTarget(null)
    await fetchTestCases()
  }

  const sections = useMemo(() => groupBySection(testCases), [testCases])

  const summary = useMemo(() => {
    const total = testCases.length
    const automated = testCases.filter((t) => t.automatable).length
    const passed = testCases.filter((t) => t.runs[0]?.status === 'PASS').length
    const failed = testCases.filter((t) => t.runs[0]?.status === 'FAIL' || t.runs[0]?.status === 'ERROR').length
    const notRun = total - passed - failed
    return { total, automated, manual: total - automated, passed, failed, notRun }
  }, [testCases])

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 overflow-hidden dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex flex-1 overflow-hidden">
        <NavRail active="testcases" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Test Cases</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Pulled from the QA test plan. {summary.automated} of {summary.total} are automated (Playwright, driving this app directly); the rest are guided manual runs.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-500 dark:border-zinc-800">Total: {summary.total}</span>
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-500">Pass: {summary.passed}</span>
              <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-500">Fail: {summary.failed}</span>
              <span className="rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-1 text-zinc-400">Not Run: {summary.notRun}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-zinc-400 dark:text-zinc-600">Loading…</div>
            ) : (
              sections.map(([section, cases]) => (
                <div key={section} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{section}</p>
                  </div>
                  {cases.map((tc) => (
                    <TestCaseRow key={tc.id} testCase={tc} running={runningId === tc.id} onStart={handleStart} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {manualTarget && (
        <ManualRunPanel testCase={manualTarget} onClose={() => setManualTarget(null)} onResult={handleManualResult} />
      )}
    </div>
  )
}
