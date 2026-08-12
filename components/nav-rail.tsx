'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Shield, Scale, Gavel, Inbox, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface NavRailProps {
  active: 'home' | 'dashboard' | 'legal' | 'cases'
}

// Icon deliberately doesn't reuse Shield — that's now the product logo mark
// at the top of the rail, so "Broker Response" the nav section needs its
// own distinct icon (Inbox — it's the triage queue) to avoid two identical
// shields in the same narrow rail.
const SECTIONS = [
  { id: 'home' as const, label: 'Overview', href: '/', icon: Home },
  { id: 'dashboard' as const, label: 'Broker Response', href: '/responses', icon: Inbox },
  { id: 'cases' as const, label: 'Case Tracker', href: '/case-tracker', icon: Gavel },
  { id: 'legal' as const, label: 'Legal Workbook', href: '/legal-workbook', icon: Scale },
]

const COLLAPSE_STORAGE_KEY = 'nav-rail-collapsed'

export function NavRail({ active }: NavRailProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  // Read after mount (like theme-provider.tsx's theme sync) rather than in
  // useState's initializer, so server and first client render match and
  // there's no hydration mismatch — the rail briefly renders expanded, then
  // snaps to the stored state.
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true')
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next))
      return next
    })
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const itemClass = (isActive: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-md text-sm transition-colors',
      collapsed ? 'h-9 justify-center px-0' : 'px-3 py-2',
      isActive
        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
    )

  return (
    <nav
      className={cn(
        'flex h-full shrink-0 flex-col justify-between border-r border-zinc-200 bg-white py-4 transition-[width] dark:border-zinc-800 dark:bg-zinc-950',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      <div>
        {/* Product logo + name, matching the login screen's mark (blue
            rounded square, Shield icon) — collapses to just the mark. */}
        <div className={cn('mb-4 flex items-center gap-2 px-3', collapsed ? 'flex-col px-0' : 'justify-between')}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">Broker Response Manager</span>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            data-testid="nav-collapse-toggle"
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors',
              collapsed && 'mt-1'
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2">
          {SECTIONS.map((section) => {
            const isActive = section.id === active
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => router.push(section.href)}
                title={section.label}
                aria-label={section.label}
                data-testid={`nav-${section.id}`}
                className={itemClass(isActive)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-2">
        <ThemeToggle showLabel={!collapsed} />
        <button
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          data-testid="nav-logout"
          className={itemClass(false)}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </nav>
  )
}
