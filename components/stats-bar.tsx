'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Zap, DollarSign } from 'lucide-react'
import { type StatsData, type Tag } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

const FEATURED_TAGS: Tag[] = [
  'CONFIRMED_REMOVAL',
  'CONFIRMED_NOT_FOUND',
  'NEEDS_MORE_INFO',
  'FORM_REQUIRED',
  'DENIED_JURISDICTION',
  'AMBIGUOUS',
]

function sumLabel(data: StatsData, label: string): number {
  return (
    (data.classifications?.tier_1?.labels?.[label] ?? 0) +
    (data.classifications?.tier_2?.labels?.[label] ?? 0) +
    (data.classifications?.tier_3?.labels?.[label] ?? 0)
  )
}

export function StatsBar() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data?.classifications) setStats(data)
      })
      .catch(() => {})
  }, [])

  const totalProcessed = stats
    ? (stats.classifications?.tier_1?.total ?? 0) +
      (stats.classifications?.tier_2?.total ?? 0) +
      (stats.classifications?.tier_3?.total ?? 0)
    : null

  const totalCost = stats?.llm?.cost_usd
    ? Object.values(stats.llm.cost_usd).reduce((a, b) => a + b, 0)
    : null

  return (
    <div className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-6 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-4 pr-6 border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-zinc-900 font-medium dark:text-zinc-100">
              {totalProcessed !== null ? totalProcessed.toLocaleString() : '—'}
            </span>
            <span>processed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-900 font-medium dark:text-zinc-100">
              {stats ? stats.llm.actual_calls.toLocaleString() : '—'}
            </span>
            <span>LLM calls</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-900 font-medium dark:text-zinc-100">
              {totalCost !== null ? `$${totalCost.toFixed(2)}` : '—'}
            </span>
            <span>cost</span>
          </div>
        </div>

        {FEATURED_TAGS.map((tag) => {
          const config = TAG_CONFIG[tag]
          const count = stats ? sumLabel(stats, tag) : null
          return (
            <div key={tag} className="flex shrink-0 items-center gap-2">
              <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {count !== null ? count.toLocaleString() : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
