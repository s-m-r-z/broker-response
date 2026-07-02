'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  count: number
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  onClick?: () => void
}

export function StatCard({ label, count, icon: Icon, color, bgColor, borderColor, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-opacity hover:opacity-80',
        bgColor,
        borderColor
      )}
    >
      <Icon className={cn('h-4 w-4', color)} />
      <div>
        <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{count}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </button>
  )
}
