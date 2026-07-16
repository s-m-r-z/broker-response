'use client'

import { useState, useEffect } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { type BrokerResponse, type Stakeholder } from '@/lib/types'
import { STAKEHOLDER_CONFIG } from '@/lib/constants'

interface AssignStakeholderDialogProps {
  open: boolean
  onClose: () => void
  response: BrokerResponse | null
  onAssigned: () => void
}

export function AssignStakeholderDialog({ open, onClose, response, onAssigned }: AssignStakeholderDialogProps) {
  const [assignedTo, setAssignedTo] = useState<Stakeholder | ''>('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Prefills whichever stakeholder currently holds this response (if any),
  // and clears the note — re-applies whenever the dialog opens, e.g. if the
  // user reopens it against the same or a different response.
  useEffect(() => {
    if (open) {
      setAssignedTo(response?.assignedTo ?? '')
      setNote('')
      setError(null)
    }
  }, [open, response?.assignedTo])

  const canSubmit = !!assignedTo && !!response

  async function handleAssign() {
    if (!canSubmit || !response) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/responses/${response.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo, note: note.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to assign')
      }
      onAssigned()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to assign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="right-auto top-1/2 left-1/2 h-fit w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
        <DialogHeader>
          <DialogTitle>Assign Stakeholder</DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Assigning does not change this response's status — status is only changed by Escalate/Resolve/Re-send.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="assign-stakeholder-select" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Assign to
            </label>
            <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v as Stakeholder)}>
              <SelectTrigger id="assign-stakeholder-select" data-testid="assign-stakeholder-select">
                <SelectValue placeholder="Select a stakeholder…" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STAKEHOLDER_CONFIG) as Stakeholder[]).map((s) => (
                  <SelectItem key={s} value={s} data-testid={`assign-stakeholder-option-${s}`}>
                    {STAKEHOLDER_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="assign-stakeholder-note" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Note (context for the stakeholder)
            </label>
            <Textarea
              id="assign-stakeholder-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Needs a call on how to handle this jurisdiction's exemption clause"
              rows={3}
              className="min-h-[72px]"
              data-testid="assign-stakeholder-note"
            />
          </div>

          {error && (
            <p data-testid="assign-stakeholder-error" className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} data-testid="assign-stakeholder-cancel">
            Cancel
          </Button>
          <Button size="sm" onClick={handleAssign} disabled={saving || !canSubmit} data-testid="assign-stakeholder-submit">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
