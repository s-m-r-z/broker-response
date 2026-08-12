'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { type TestCase } from '@/lib/types'
import { Button } from '../ui/button'

interface ManualRunPanelProps {
  testCase: TestCase
  onClose: () => void
  onResult: (status: 'PASS' | 'FAIL') => Promise<void>
}

// The guided manual-run flow: a tester reads the scenario/expected result
// here, goes and performs the steps themselves in the app (this panel
// doesn't navigate for them — the 71 manual-only cases span behavior this
// app doesn't implement, so there's no one screen to send them to), then
// records the outcome.
export function ManualRunPanel({ testCase, onClose, onResult }: ManualRunPanelProps) {
  const [submitting, setSubmitting] = useState<'PASS' | 'FAIL' | null>(null)

  async function handleResult(status: 'PASS' | 'FAIL') {
    setSubmitting(status)
    await onResult(status)
    setSubmitting(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
        data-testid="manual-run-panel"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">{testCase.tcId} · Manual Run</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{testCase.userStory}</p>
          </div>
          <button onClick={onClose} aria-label="Close" data-testid="manual-run-panel-close" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">Scenario</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{testCase.scenario}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">Expected Result</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{testCase.expected}</p>
          </div>
          <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            Perform the steps above yourself in the app, then record what happened.
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <Button
            variant="success"
            className="flex-1"
            disabled={!!submitting}
            onClick={() => handleResult('PASS')}
            data-testid="manual-run-pass"
          >
            {submitting === 'PASS' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Pass
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!!submitting}
            onClick={() => handleResult('FAIL')}
            data-testid="manual-run-fail"
          >
            {submitting === 'FAIL' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Fail
          </Button>
        </div>
      </div>
    </div>
  )
}
