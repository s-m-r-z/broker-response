'use client'

import { type Tag } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface TagBreakdownProps {
  counts: Record<Tag, number>
  onSelectTag: (tag: Tag) => void
}

export function TagBreakdown({ counts, onSelectTag }: TagBreakdownProps) {
  const rows = (Object.keys(TAG_CONFIG) as Tag[])
    .map((tag) => ({ tag, count: counts[tag] ?? 0, config: TAG_CONFIG[tag] }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const max = Math.max(...rows.map((r) => r.count), 1)

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-400">No tagged responses yet.</p>
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {rows.map(({ tag, count, config }) => (
        <InfoTooltip key={tag} content={config.description}>
          <button
            onClick={() => onSelectTag(tag)}
            data-testid={`tag-breakdown-row-${tag}`}
            className="flex w-full items-center gap-3 text-left"
          >
            <span className="flex w-32 shrink-0 items-center gap-1.5 truncate text-xs text-zinc-600 dark:text-zinc-400">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dotColor)} />
              <span className="truncate">{config.label}</span>
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={cn('h-full rounded-full', config.barColor)} style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {count}
            </span>
          </button>
        </InfoTooltip>
      ))}
    </div>
  )
}
