'use client'

import { ENFORCEMENT_STAGES, type EnforcementStage } from '@/lib/case-tracker'
import { STAGE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface StageBreakdownProps {
  counts: Record<EnforcementStage, number>
  onSelectStage: (stage: EnforcementStage) => void
}

// Shown in pipeline order (not sorted by count) and every stage renders even
// at zero, so the bars read as a funnel shape rather than a ranked list.
export function StageBreakdown({ counts, onSelectStage }: StageBreakdownProps) {
  const rows = ENFORCEMENT_STAGES.map((stage) => ({ stage, count: counts[stage] ?? 0, config: STAGE_CONFIG[stage] }))
  const max = Math.max(...rows.map((r) => r.count), 1)
  const total = rows.reduce((n, r) => n + r.count, 0)

  if (total === 0) {
    return <p className="text-sm text-zinc-400">No cases yet.</p>
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {rows.map(({ stage, count, config }) => {
        const Icon = config.icon
        return (
        <InfoTooltip key={stage} content={config.description}>
          <button
            onClick={() => onSelectStage(stage)}
            data-testid={`stage-breakdown-row-${stage}`}
            className="flex w-full items-center gap-3 text-left"
          >
            <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', config.bgColor)}>
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>
            <span className="w-32 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400">{config.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={cn('h-full rounded-full', config.barColor)} style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {count}
            </span>
          </button>
        </InfoTooltip>
        )
      })}
    </div>
  )
}
