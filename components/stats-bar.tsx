'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Zap, DollarSign } from 'lucide-react'
import { type StatsData, type Tag } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

function sumLabel(data: StatsData, label: string): number {
  return (
    (data.classifications.tier_1.labels[label] ?? 0) +
    (data.classifications.tier_2.labels[label] ?? 0) +
    (data.classifications.tier_3.labels[label] ?? 0)
  )
}

const FEATURED_TAGS: Tag[] = [
  'CONFIRMED_REMOVAL',
  'CONFIRMED_NOT_FOUND',
  'NEEDS_MORE_INFO',
  'FORM_REQUIRED',
  'DENIED_JURISDICTION',
  'AMBIGUOUS',
]

export function StatsBar() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError(true))
  }, [])

  if (error) return null

  const totalProcessed = stats
    ? stats.classifications.tier_1.total +
      stats.classifications.tier_2.total +
      stats.classifications.tier_3.total
    : null

  const totalCost = stats
    ? Object.values(stats.llm.cost_usd).reduce((a, b) => a + b, 0)
    : null

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="flex items-center gap-6 overflow-x-auto">
        {/* Total + LLM meta */}
        <div className="flex shrink-0 items-center gap-4 pr-6 border-r border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-zinc-100 font-medium">
              {totalProcessed !== null ? totalProcessed.toLocaleString() : '—'}
            </span>
            <span>processed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-100 font-medium">
              {stats ? stats.llm.actual_calls.toLocaleString() : '—'}
            </span>
            <span>LLM calls</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-100 font-medium">
              {totalCost !== null ? `$${totalCost.toFixed(2)}` : '—'}
            </span>
            <span>cost</span>
          </div>
        </div>

        {/* Tag counts */}
        {FEATURED_TAGS.map((tag) => {
          const config = TAG_CONFIG[tag]
          const count = stats ? sumLabel(stats, tag) : null
          return (
            <div key={tag} className="flex shrink-0 items-center gap-2">
              <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
              <span className="text-sm font-semibold text-zinc-100">
                {count !== null ? count.toLocaleString() : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
