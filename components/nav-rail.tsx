'use client'

import { useRouter } from 'next/navigation'
import { Home, Shield, Scale, Gavel, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface NavRailProps {
  active: 'home' | 'dashboard' | 'legal' | 'cases'
}

const SECTIONS = [
  { id: 'home' as const, label: 'Overview', href: '/', icon: Home },
  { id: 'dashboard' as const, label: 'Broker Response', href: '/responses', icon: Shield },
  { id: 'cases' as const, label: 'Case Tracker', href: '/case-tracker', icon: Gavel },
  { id: 'legal' as const, label: 'Legal Workbook', href: '/legal-workbook', icon: Scale },
]

export function NavRail({ active }: NavRailProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex h-full w-14 shrink-0 flex-col items-center justify-between border-r border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
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
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          data-testid="nav-logout"
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
