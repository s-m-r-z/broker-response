'use client'

import { CheckCircle2, XCircle, Loader2, HelpCircle, User, Bot } from 'lucide-react'
import { type TestCase } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface TestCaseRowProps {
  testCase: TestCase
  running: boolean
  onStart: (testCase: TestCase) => void
}

const TYPE_STYLES: Record<TestCase['type'], string> = {
  HAPPY: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  NEGATIVE: 'border-red-500/20 bg-red-500/10 text-red-500',
  EDGE: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
}

const TYPE_LABELS: Record<TestCase['type'], string> = {
  HAPPY: 'Happy Path',
  NEGATIVE: 'Negative',
  EDGE: 'Edge Case',
}

function StatusPill({ testCase, running }: { testCase: TestCase; running: boolean }) {
  if (running) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    )
  }
  const lastRun = testCase.runs[0]
  if (!lastRun) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
        <HelpCircle className="h-3 w-3" />
        Not Run
      </span>
    )
  }
  if (lastRun.status === 'PASS') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500" data-testid={`test-case-status-${testCase.tcId}`}>
        <CheckCircle2 className="h-3 w-3" />
        Pass
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-500" data-testid={`test-case-status-${testCase.tcId}`}>
      <XCircle className="h-3 w-3" />
      {lastRun.status === 'ERROR' ? 'Error' : 'Fail'}
    </span>
  )
}

export function TestCaseRow({ testCase, running, onStart }: TestCaseRowProps) {
  const lastRun = testCase.runs[0]
  return (
    <div
      className="flex items-start justify-between gap-4 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800/60"
      data-testid={`test-case-row-${testCase.tcId}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{testCase.tcId}</span>
          <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium', TYPE_STYLES[testCase.type])}>
            {TYPE_LABELS[testCase.type]}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
              testCase.automatable
                ? 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
            )}
          >
            {testCase.automatable ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
            {testCase.automatable ? 'Automated' : 'Manual'}
          </span>
          <StatusPill testCase={testCase} running={running} />
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{testCase.scenario}</p>
        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-600">→ {testCase.expected}</p>
        {lastRun?.log && (
          <p className="mt-1 text-[11px] italic text-zinc-400 dark:text-zinc-600">{lastRun.log}</p>
        )}
      </div>
      <Button
        size="sm"
        variant={testCase.automatable ? 'default' : 'outline'}
        disabled={running}
        onClick={() => onStart(testCase)}
        data-testid={`test-case-start-${testCase.tcId}`}
        className="shrink-0"
      >
        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Start
      </Button>
    </div>
  )
}
