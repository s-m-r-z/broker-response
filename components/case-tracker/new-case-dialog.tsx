'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type Case } from '@/lib/types'

interface NewCaseDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (kase: Case) => void
}

export function NewCaseDialog({ open, onClose, onCreated }: NewCaseDialogProps) {
  const [userCountry, setUserCountry] = useState('')
  const [userState, setUserState] = useState('')
  const [brokerName, setBrokerName] = useState('')
  const [brokerCountry, setBrokerCountry] = useState('')
  const [removalRequestDate, setRemovalRequestDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = userCountry && brokerName && brokerCountry && removalRequestDate

  function reset() {
    setUserCountry('')
    setUserState('')
    setBrokerName('')
    setBrokerCountry('')
    setRemovalRequestDate('')
    setError(null)
  }

  async function handleCreate() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCountry,
          userState: userState || undefined,
          brokerName,
          brokerCountry,
          removalRequestDate: new Date(removalRequestDate).toISOString(),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to create case')
      }
      const kase: Case = await res.json()
      reset()
      onCreated(kase)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="right-auto top-1/2 left-1/2 h-fit w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
        <DialogHeader>
          <DialogTitle>New Case</DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Jurisdiction, deadline, and filing authority are derived from the user's location — never the broker's.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">User country</label>
              <Input value={userCountry} onChange={(e) => setUserCountry(e.target.value)} placeholder="e.g. Germany" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">User state (US only)</label>
              <Input value={userState} onChange={(e) => setUserState(e.target.value)} placeholder="e.g. California" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Broker name</label>
            <Input value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="e.g. Acme Data Inc." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Broker country</label>
            <Input value={brokerCountry} onChange={(e) => setBrokerCountry(e.target.value)} placeholder="e.g. United States" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Removal request date</label>
            <Input
              type="date"
              value={removalRequestDate}
              onChange={(e) => setRemovalRequestDate(e.target.value)}
            />
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
          <Button size="sm" onClick={handleCreate} disabled={saving || !canSubmit}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
