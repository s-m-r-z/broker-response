'use client'

import { Plus } from 'lucide-react'
import { type LawRegime } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface RegimeSidebarProps {
  regimes: LawRegime[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddNew: () => void
}

export function RegimeSidebar({ regimes, selectedId, onSelect, onAddNew }: RegimeSidebarProps) {
  const grouped = regimes.reduce<Record<string, LawRegime[]>>((acc, r) => {
    acc[r.country] = acc[r.country] ?? []
    acc[r.country].push(r)
    return acc
  }, {})

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Legal Workbook</p>
        <p className="text-[10px] text-zinc-500">Data protection reference</p>
      </div>

      <div className="px-2 pt-3">
        <Button size="sm" variant="outline" className="w-full" onClick={onAddNew}>
          <Plus className="h-3.5 w-3.5" />
          Add Jurisdiction
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {Object.entries(grouped).map(([country, list]) => (
          <div key={country} className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              {country}
            </p>
            {list.map((regime) => {
              const isActive = regime.id === selectedId
              const pendingCount = regime.clauses.reduce((n, c) => n + c.pendingChanges.length, 0)
              return (
                <button
                  key={regime.id}
                  onClick={() => onSelect(regime.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                  )}
                >
                  <span className="flex-1 text-left">
                    {regime.name}
                    {regime.state && <span className="text-zinc-400"> · {regime.state}</span>}
                  </span>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 text-[10px] font-medium text-amber-500">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
        {regimes.length === 0 && (
          <p className="px-2 text-sm text-zinc-400">No jurisdictions yet.</p>
        )}
      </nav>
    </aside>
  )
}
