import { type RegimeCode } from '@/lib/jurisdiction-map'
import { REGIME_LABELS, REGIME_DESCRIPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface RegimeBadgeProps {
  regime: RegimeCode
  className?: string
}

export function RegimeBadge({ regime, className }: RegimeBadgeProps) {
  return (
    <InfoTooltip content={REGIME_DESCRIPTIONS[regime]}>
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400',
          className
        )}
      >
        {REGIME_LABELS[regime]}
      </span>
    </InfoTooltip>
  )
}
