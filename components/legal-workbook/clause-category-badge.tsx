import { CLAUSE_CATEGORY_LABELS, CLAUSE_CATEGORY_DESCRIPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

export function ClauseCategoryBadge({ category, className }: { category: string; className?: string }) {
  const description = CLAUSE_CATEGORY_DESCRIPTIONS[category]
  const badge = (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400',
        className
      )}
    >
      {CLAUSE_CATEGORY_LABELS[category] ?? category}
    </span>
  )
  return description ? <InfoTooltip content={description}>{badge}</InfoTooltip> : badge
}
