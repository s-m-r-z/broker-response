import { type Stakeholder } from '@/lib/types'
import { STAKEHOLDER_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from './info-tooltip'

interface AssigneeBadgeProps {
  assignedTo: Stakeholder
  className?: string
}

export function AssigneeBadge({ assignedTo, className }: AssigneeBadgeProps) {
  const config = STAKEHOLDER_CONFIG[assignedTo]
  const Icon = config.icon
  return (
    <InfoTooltip content={config.description}>
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
    </InfoTooltip>
  )
}
