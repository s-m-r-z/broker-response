import { Check } from 'lucide-react'
import { ENFORCEMENT_STAGES, type EnforcementStage } from '@/lib/case-tracker'
import { STAGE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StagePipelineProps {
  stage: EnforcementStage
}

// Read-only breadcrumb of where a case sits in the enforcement timeline.
// There's no API to transition enforcementStage yet (out of scope — see
// lib/case-tracker.ts), so this only ever reflects the stored value.
export function StagePipeline({ stage }: StagePipelineProps) {
  const currentIndex = ENFORCEMENT_STAGES.indexOf(stage)

  return (
    <div className="flex items-center overflow-x-auto">
      {ENFORCEMENT_STAGES.map((s, i) => {
        const config = STAGE_CONFIG[s]
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture = i > currentIndex

        return (
          <div key={s} className="flex items-center shrink-0">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap',
                isCurrent && [config.color, config.bgColor, config.borderColor],
                isDone && 'border-zinc-500/20 bg-zinc-500/5 text-zinc-500 dark:text-zinc-400',
                isFuture && 'border-transparent text-zinc-400 dark:text-zinc-600'
              )}
            >
              {isDone ? <Check className="h-3 w-3" /> : <config.icon className="h-3 w-3" />}
              {config.label}
            </div>
            {i < ENFORCEMENT_STAGES.length - 1 && (
              <div className={cn('h-px w-4 shrink-0', isDone ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-200 dark:bg-zinc-800')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
