import { TriangleAlert, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// Color is kept to a thin accent (icon + title only) rather than washing the
// whole box and its body text — matches how GitHub/GitLab diffs and Notion
// callouts stay readable even when several appear on the same page.
const VARIANTS = {
  warning: {
    icon: TriangleAlert,
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-600 dark:text-blue-400',
  },
} as const

interface CalloutProps {
  variant: keyof typeof VARIANTS
  title?: string
  children: React.ReactNode
  className?: string
}

export function Callout({ variant, title, children, className }: CalloutProps) {
  const v = VARIANTS[variant]
  const Icon = v.icon
  return (
    <div className={cn('flex items-start gap-2 rounded-md border p-3', v.border, v.bg, className)}>
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', v.iconColor)} />
      <div className="min-w-0">
        {title && (
          <p className={cn('mb-1 text-[11px] font-semibold uppercase tracking-wider', v.titleColor)}>{title}</p>
        )}
        <div className="text-xs text-zinc-600 dark:text-zinc-400">{children}</div>
      </div>
    </div>
  )
}
