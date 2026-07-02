'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavTileProps {
  icon: LucideIcon
  iconBg: string
  title: string
  description: string
  onClick: () => void
}

export function NavTile({ icon: Icon, iconBg, title, description, onClick }: NavTileProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', iconBg)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
    </button>
  )
}
