'use client'

import { useState } from 'react'
import { Inbox, RefreshCw, Loader2 } from 'lucide-react'
import { type LawRegime } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { ClauseCard } from './clause-card'
import { Callout } from './callout'

interface RegimeDetailProps {
  regime: LawRegime | null
  onRecheck: (id: string) => Promise<void>
  onToggleVerified: (id: string, verified: boolean) => Promise<void>
  onReviewChange: (changeId: string, action: 'accept' | 'reject') => Promise<void>
}

export function RegimeDetail({ regime, onRecheck, onToggleVerified, onReviewChange }: RegimeDetailProps) {
  const [rechecking, setRechecking] = useState(false)

  if (!regime) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600">
        <Inbox className="h-10 w-10" />
        <p className="text-sm">Select a jurisdiction to view its clauses</p>
      </div>
    )
  }

  async function handleRecheck() {
    setRechecking(true)
    await onRecheck(regime!.id)
    setRechecking(false)
  }

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {regime.name}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {regime.state ? `${regime.state}, ${regime.country}` : regime.country}
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={rechecking} onClick={handleRecheck}>
            {rechecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Check for Updates
          </Button>
        </div>
        {regime.description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{regime.description}</p>
        )}
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
          {regime.lastCheckedAt ? `Last checked ${formatRelativeTime(regime.lastCheckedAt)}` : 'Never checked'}
          {regime.sourceModel && ` · source: ${regime.sourceModel}`}
        </p>
      </div>

      <div className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <Callout variant="warning">
          This content is AI-generated and may be placeholder data. Do not cite it to a broker or rely on it for a
          compliance decision until a qualified member of legal counsel has verified the clause.
        </Callout>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {regime.clauses.map((clause) => (
          <ClauseCard
            key={clause.id}
            clause={clause}
            onToggleVerified={onToggleVerified}
            onReviewChange={onReviewChange}
          />
        ))}
        {regime.clauses.length === 0 && (
          <p className="text-sm text-zinc-400">No clauses recorded for this jurisdiction yet.</p>
        )}
      </div>
    </div>
  )
}
