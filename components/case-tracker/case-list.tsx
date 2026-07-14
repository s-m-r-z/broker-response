'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { type Case } from '@/lib/types'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { StageBadge } from './stage-badge'
import { RegimeBadge } from './regime-badge'
import { DeadlineChip } from './deadline-chip'

interface CaseListProps {
  cases: Case[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onNewCase: () => void
  onRefresh: () => void
}

export function CaseList({ cases, loading, selectedId, onSelect, onNewCase, onRefresh }: CaseListProps) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-3 py-3 space-y-2 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {cases.length > 0 ? `${cases.length} cases` : 'Cases'}
          </p>
          <button
            onClick={onRefresh}
            className="text-zinc-900 opacity-70 hover:opacity-100 transition-opacity dark:text-zinc-100"
            title="Refresh"
            aria-label="Refresh"
            data-testid="case-list-refresh"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={onNewCase} data-testid="case-list-new-case">
          <Plus className="h-3.5 w-3.5" />
          New Case
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm dark:text-zinc-600">
            Loading…
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600">
            <p className="text-sm">No cases yet</p>
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              data-testid={`case-row-${c.id}`}
              className={cn(
                'group flex cursor-pointer flex-col gap-1 border-b border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-900',
                selectedId === c.id && 'bg-zinc-50 border-l-2 border-l-blue-600 dark:bg-zinc-900'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.brokerName}</p>
                <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600">{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="truncate text-xs text-zinc-500">
                {c.userState ? `${c.userState}, ${c.userCountry}` : c.userCountry}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <RegimeBadge regime={c.applicableRegime} />
                <StageBadge stage={c.enforcementStage} />
                <DeadlineChip deadline={c.responseDeadlineDate} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
