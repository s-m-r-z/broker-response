'use client'

import { useState } from 'react'
import { Loader2, Scale } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { type Case } from '@/lib/types'

interface StructuredConfirmationDialogProps {
  open: boolean
  onClose: () => void
  caseId: string
  onConfirmed: (updated: Case) => void
}

// The structured internal confirmation form (US-18) — four required fields
// plus the responder's name, batch-confirming the matching evidence
// checklist items (systems/reply/retention exception) in one submission
// instead of three separate follow-up asks.
export function StructuredConfirmationDialog({ open, onClose, caseId, onConfirmed }: StructuredConfirmationDialogProps) {
  const [systemName, setSystemName] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [date, setDate] = useState('')
  const [retentionException, setRetentionException] = useState('')
  const [responderName, setResponderName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = !!(systemName.trim() && actionTaken.trim() && date && retentionException.trim() && responderName.trim())

  function reset() {
    setSystemName('')
    setActionTaken('')
    setDate('')
    setRetentionException('')
    setResponderName('')
    setError(null)
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/structured-confirmation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName: systemName.trim(),
          actionTaken: actionTaken.trim(),
          date,
          retentionException: retentionException.trim(),
          responderName: responderName.trim(),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to submit confirmation')
      }
      const updated: Case = await res.json()
      reset()
      onConfirmed(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit confirmation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="right-auto top-1/2 left-1/2 h-fit w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
        <DialogHeader>
          <DialogTitle>Structured Confirmation</DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            All fields are required — an incomplete submission is blocked, not partially saved.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="sc-system-name" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">System name</label>
            <Input id="sc-system-name" data-testid="structured-confirmation-system" value={systemName} onChange={(e) => setSystemName(e.target.value)} placeholder="e.g. Primary CRM" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sc-action-taken" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Action taken</label>
            <Input id="sc-action-taken" data-testid="structured-confirmation-action" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="e.g. Record permanently deleted" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sc-date" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Date</label>
            <Input id="sc-date" data-testid="structured-confirmation-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sc-retention" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Retention exception</label>
            <Input id="sc-retention" data-testid="structured-confirmation-retention" value={retentionException} onChange={(e) => setRetentionException(e.target.value)} placeholder="Exception, or “None”" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="sc-responder" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Responder name</label>
            <Input id="sc-responder" data-testid="structured-confirmation-responder" value={responderName} onChange={(e) => setResponderName(e.target.value)} placeholder="Who is confirming this" />
          </div>

          {error && (
            <p data-testid="structured-confirmation-error" className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} data-testid="structured-confirmation-cancel">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || !canSubmit} data-testid="structured-confirmation-submit">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Scale className="h-3.5 w-3.5" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
