import { type EnforcementStage } from '@/lib/case-tracker'
import { STAGE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StageBadgeProps {
  stage: EnforcementStage
  className?: string
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
