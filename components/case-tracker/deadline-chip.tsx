import { Clock, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeadlineChipProps {
  deadline: string
  /**
   * True once the case is closed or has reached complaint_filed — the
   * deadline is no longer actionable at that point, so "Overdue by Nd" /
   * "Due in Nd" urgency styling is misleading (a closed case sitting past
   * its deadline isn't something anyone still needs to act on). Callers
   * pass !!kase.closedAt || kase.enforcementStage === 'complaint_filed'.
   */
  isFinal?: boolean
  className?: string
}

// Days remaining is computed live from the deadline vs. now — independent of
// the case's stored enforcementStage, which only advances when someone acts.
export function DeadlineChip({ deadline, isFinal, className }: DeadlineChipProps) {
  const now = new Date()
  const due = new Date(deadline)
  const daysRemaining = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)

  const dateLabel = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  if (isFinal) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400',
          className
        )}
      >
        <Clock className="h-3 w-3" />
        Was due {dateLabel}
      </span>
    )
  }

  if (daysRemaining < 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400',
          className
        )}
      >
        <TriangleAlert className="h-3 w-3" />
        Overdue by {Math.abs(daysRemaining)}d
      </span>
    )
  }

  if (daysRemaining <= 5) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400',
          className
        )}
      >
        <Clock className="h-3 w-3" />
        Due in {daysRemaining}d
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-400',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      Due {dateLabel}
    </span>
  )
}
