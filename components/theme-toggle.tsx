'use client'

import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './theme-provider'

interface ThemeToggleProps {
  showLabel?: boolean
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors',
        showLabel ? 'w-full gap-2.5 px-3 py-2 text-sm' : 'h-9 w-9 justify-center'
      )}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="theme-toggle"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      {showLabel && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  )
}
