import { HOLDING_REPLY_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from './info-tooltip'

interface HoldingReplyBadgeProps {
  className?: string
}

export function HoldingReplyBadge({ className }: HoldingReplyBadgeProps) {
  const config = HOLDING_REPLY_CONFIG
  const Icon = config.icon
  return (
    <InfoTooltip content={config.description}>
      <span
        data-testid="holding-reply-badge"
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
