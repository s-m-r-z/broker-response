'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Shield, Scale, Gavel, Inbox, LogOut, PanelLeftClose, PanelLeftOpen, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface NavRailProps {
  active: 'home' | 'dashboard' | 'legal' | 'cases' | 'testcases'
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
  { id: 'testcases' as const, label: 'Test Cases', href: '/test-cases', icon: ListChecks },
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
      'group relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
      collapsed ? 'h-9 justify-center px-0' : 'px-3 py-2.5',
      isActive
        ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
    )

  const activeAccent = (isActive: boolean) =>
    cn(
      'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full transition-all duration-150',
      isActive
        ? 'h-5 bg-blue-500'
        : 'h-0 bg-transparent'
    )

  return (
    <nav
      className={cn(
        'flex h-full shrink-0 flex-col justify-between border-r border-zinc-200 bg-white py-5 transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Top: logo + nav */}
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className={cn('px-4', collapsed && 'flex flex-col items-center gap-3 px-0')}>
          {collapsed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/30">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <button
                onClick={toggleCollapsed}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                data-testid="nav-collapse-toggle"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <PanelLeftOpen className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/30">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">Broker Response</p>
                  <p className="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">Manager</p>
                </div>
              </div>
              <button
                onClick={toggleCollapsed}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                data-testid="nav-collapse-toggle"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className={cn('flex flex-col gap-0.5', collapsed ? 'px-2' : 'px-3')}>
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
                {/* Left accent bar — incident.io style */}
                {!collapsed && <span className={activeAccent(isActive)} />}
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-500' : '')} />
                {!collapsed && <span>{section.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom: theme + logout */}
      <div className={cn('flex flex-col gap-0.5', collapsed ? 'px-2' : 'px-3')}>
        <div className={cn(
          'mb-2 border-t border-zinc-100 dark:border-zinc-800',
          collapsed ? '-mx-0 pt-3' : '-mx-0 pt-3'
        )} />
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
