import { type Tag } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: Tag
  className?: string
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  const config = TAG_CONFIG[tag]
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
