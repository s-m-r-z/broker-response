import { TriangleAlert, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  warning: {
    icon: TriangleAlert,
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    iconColor: 'text-amber-700 dark:text-amber-400',
    titleColor: 'text-amber-700 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    titleColor: 'text-emerald-700 dark:text-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    iconColor: 'text-blue-700 dark:text-blue-400',
    titleColor: 'text-blue-700 dark:text-blue-400',
    textColor: 'text-blue-700 dark:text-blue-400',
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
        <div className={cn('text-xs', v.textColor)}>{children}</div>
      </div>
    </div>
  )
}
