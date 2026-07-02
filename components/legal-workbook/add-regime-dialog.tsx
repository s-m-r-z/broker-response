'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface AddRegimeDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddRegimeDialog({ open, onClose, onCreated }: AddRegimeDialogProps) {
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [regimeName, setRegimeName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!country || !regimeName) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/legal/regimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, state: state || undefined, regimeName }),
      })
      if (!res.ok) throw new Error(await res.text())
      setCountry('')
      setState('')
      setRegimeName('')
      onCreated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add jurisdiction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="right-auto top-1/2 left-1/2 h-fit w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
        <DialogHeader>
          <DialogTitle>Add Jurisdiction</DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Generates a placeholder set of clauses for this jurisdiction. Content is unverified until legal counsel reviews it.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Australia" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">State / Province (optional)</label>
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. New South Wales" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Regime name</label>
            <Input value={regimeName} onChange={(e) => setRegimeName(e.target.value)} placeholder="e.g. Privacy Act 1988" />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="legal" size="sm" onClick={handleCreate} disabled={saving || !country || !regimeName}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
