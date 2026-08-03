'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, ExternalLink } from 'lucide-react'
import { type Case } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { StageBadge } from './stage-badge'

interface RelatedCasesPanelProps {
  userCountry: string | null
  userState?: string | null
  excludeId?: string
}

// Surfaces the three closest prior cases in the same jurisdiction (US-02) —
// mirrors legal-workbook/relevant-law-panel.tsx's shape (fetch on mount,
// nothing rendered if there's no jurisdiction yet or no matches).
export function RelatedCasesPanel({ userCountry, userState, excludeId }: RelatedCasesPanelProps) {
  const router = useRouter()
  const [cases, setCases] = useState<Case[] | null>(null)

  useEffect(() => {
    setCases(null)
    if (!userCountry) return
    const params = new URLSearchParams({ jurisdictionCountry: userCountry })
    if (userState) params.set('jurisdictionState', userState)
    if (excludeId) params.set('excludeId', excludeId)
    fetch(`/api/cases?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Case[] | null) => setCases(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCountry, userState, excludeId])

  if (!userCountry || !cases || cases.length === 0) return null

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
        <Scale className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
        Prior Cases in This Jurisdiction
      </p>
      <div className="space-y-2">
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/case-tracker?open=${c.id}`)}
            data-testid={`related-case-${c.id}`}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{c.brokerName}</p>
              <p className="text-[11px] text-zinc-400">{formatDate(c.createdAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StageBadge stage={c.enforcementStage} />
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
