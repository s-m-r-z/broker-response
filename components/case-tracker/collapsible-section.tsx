'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  badge?: ReactNode
  children: ReactNode
  testId?: string
}

// Wraps a case-detail.tsx section in a click-to-expand header, mirroring
// relevant-law-panel.tsx's per-regime toggle. Used for the lower-priority,
// reference/audit sections (Complaint Pack, Case History) to cut the
// default scroll length of the case detail view without hiding anything —
// see the design-audit conversation this came out of.
export function CollapsibleSection({ title, defaultOpen = false, badge, children, testId }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid={testId}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
        <p className="flex-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          {title}
        </p>
        {badge}
      </button>
      <div className={cn('px-4 pb-4', !open && 'hidden')}>{children}</div>
    </div>
  )
}
