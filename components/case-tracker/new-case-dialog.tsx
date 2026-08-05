'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type Case } from '@/lib/types'
import { RelatedCasesPanel } from './related-cases-panel'

interface NewCaseDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (kase: Case) => void
  initialBrokerName?: string
  initialBrokerCountry?: string
  initialSourceResponseId?: string
}

export function NewCaseDialog({ open, onClose, onCreated, initialBrokerName, initialBrokerCountry, initialSourceResponseId }: NewCaseDialogProps) {
  const [userCountry, setUserCountry] = useState('')
  const [userState, setUserState] = useState('')
  const [brokerName, setBrokerName] = useState('')
  const [brokerCountry, setBrokerCountry] = useState('')
  const [removalRequestDate, setRemovalRequestDate] = useState('')
  const [contractFileRef, setContractFileRef] = useState('')
  const [dataFlowNote, setDataFlowNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-applies whenever the dialog opens, e.g. with a different response's
  // broker prefilled from the dashboard's "Track as Case" action.
  useEffect(() => {
    if (open) {
      setBrokerName(initialBrokerName ?? '')
      setBrokerCountry(initialBrokerCountry ?? '')
    }
  }, [open, initialBrokerName, initialBrokerCountry])

  const canSubmit = userCountry && brokerName && brokerCountry && removalRequestDate

  function reset() {
    setUserCountry('')
    setUserState('')
    setBrokerName('')
    setBrokerCountry('')
    setRemovalRequestDate('')
    setContractFileRef('')
    setDataFlowNote('')
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
          sourceResponseId: initialSourceResponseId,
          contractFileRef: contractFileRef.trim() || undefined,
          dataFlowNote: dataFlowNote.trim() || undefined,
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
              <label htmlFor="new-case-user-country" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">User country</label>
              <Input id="new-case-user-country" data-testid="new-case-user-country" value={userCountry} onChange={(e) => setUserCountry(e.target.value)} placeholder="e.g. Germany" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new-case-user-state" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">User state (US only)</label>
              <Input id="new-case-user-state" data-testid="new-case-user-state" value={userState} onChange={(e) => setUserState(e.target.value)} placeholder="e.g. California" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-case-broker-name" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Broker name</label>
            <Input id="new-case-broker-name" data-testid="new-case-broker-name" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="e.g. Acme Data Inc." />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-case-broker-country" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Broker country</label>
            <Input id="new-case-broker-country" data-testid="new-case-broker-country" value={brokerCountry} onChange={(e) => setBrokerCountry(e.target.value)} placeholder="e.g. United States" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-case-removal-request-date" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Removal request date</label>
            <Input
              id="new-case-removal-request-date"
              data-testid="new-case-removal-request-date"
              type="date"
              value={removalRequestDate}
              onChange={(e) => setRemovalRequestDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-case-contract-file" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Reference document (optional)</label>
            <Input id="new-case-contract-file" data-testid="new-case-contract-file" value={contractFileRef} onChange={(e) => setContractFileRef(e.target.value)} placeholder="Link or filename, if one exists" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-case-data-flow-note" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Data flow note (optional)</label>
            <Input id="new-case-data-flow-note" data-testid="new-case-data-flow-note" value={dataFlowNote} onChange={(e) => setDataFlowNote(e.target.value)} placeholder="Where this data came from / how it flows" />
          </div>

          <RelatedCasesPanel userCountry={userCountry || null} userState={userState} />

          {error && (
            <p data-testid="new-case-error" className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} data-testid="new-case-cancel">
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={saving || !canSubmit} data-testid="new-case-submit">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
