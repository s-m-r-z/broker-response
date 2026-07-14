'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface StatCardProps {
  label: string
  count: number
  icon: LucideIcon
  color: string
  bgColor: string
  description?: string
  testId?: string
  onClick?: () => void
}

export function StatCard({ label, count, icon: Icon, color, bgColor, description, testId, onClick }: StatCardProps) {
  const card = (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex h-full flex-col items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', bgColor)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{count}</p>
      </div>
    </button>
  )
  return description ? <InfoTooltip content={description}>{card}</InfoTooltip> : card
}
