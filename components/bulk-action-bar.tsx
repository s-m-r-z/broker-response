'use client'

import { CheckCircle2, Scale, Send, X, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'

interface BulkActionBarProps {
  count: number
  onClear: () => void
  onBulkAction: (action: 'RESOLVED' | 'ESCALATED_TO_LEGAL' | 'RE_SENT') => Promise<void>
}

export function BulkActionBar({ count, onClear, onBulkAction }: BulkActionBarProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handle(action: 'RESOLVED' | 'ESCALATED_TO_LEGAL' | 'RE_SENT') {
    setLoading(action)
    await onBulkAction(action)
    setLoading(null)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3 shadow-2xl shadow-zinc-200/50 animate-fade-in dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/50">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{count} selected</span>
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle('RESOLVED')}
        disabled={!!loading}
        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10"
      >
        {loading === 'RESOLVED' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        Mark Resolved
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle('ESCALATED_TO_LEGAL')}
        disabled={!!loading}
        className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:text-violet-300 dark:hover:bg-violet-500/10"
      >
        {loading === 'ESCALATED_TO_LEGAL' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Scale className="h-3.5 w-3.5" />
        )}
        Escalate to Legal
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle('RE_SENT')}
        disabled={!!loading}
        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/10"
      >
        {loading === 'RE_SENT' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        Re-send Request
      </Button>

      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

      <button onClick={onClear} className="text-zinc-400 hover:text-zinc-600 transition-colors dark:text-zinc-500 dark:hover:text-zinc-300">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
