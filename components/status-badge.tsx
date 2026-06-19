import { type Status } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {config.label}
    </span>
  )
}
