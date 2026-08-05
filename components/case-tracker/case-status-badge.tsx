import { type CaseStatus } from '@/lib/case-tracker'
import { CASE_STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface CaseStatusBadgeProps {
  status: CaseStatus
  className?: string
}

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  const config = CASE_STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <InfoTooltip content={config.description}>
      <span
        data-testid={`case-status-badge-${status}`}
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
