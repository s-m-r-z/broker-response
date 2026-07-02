'use client'

import { useRouter } from 'next/navigation'
import { Home, Shield, Scale, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface NavRailProps {
  active: 'home' | 'dashboard' | 'legal'
}

const SECTIONS = [
  { id: 'home' as const, label: 'Overview', href: '/', icon: Home, color: 'bg-zinc-700' },
  { id: 'dashboard' as const, label: 'Broker Response', href: '/responses', icon: Shield, color: 'bg-blue-600' },
  { id: 'legal' as const, label: 'Legal Workbook', href: '/legal-workbook', icon: Scale, color: 'bg-violet-600' },
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
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                isActive
                  ? cn(section.color, 'text-white')
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
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
