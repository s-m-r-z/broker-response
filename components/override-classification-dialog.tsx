'use client'

import { useState, useEffect } from 'react'
import { Loader2, Tag as TagIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { type BrokerResponse, type Tag } from '@/lib/types'
import { TAG_CONFIG } from '@/lib/constants'

interface OverrideClassificationDialogProps {
  open: boolean
  onClose: () => void
  response: BrokerResponse | null
  onOverridden: () => void
}

// Manual classification override (US-09) — the "override option" this
// app's read-only classification display was missing. See
// app/api/responses/[id]/override-tag/route.ts for why this is logged as a
// correction rather than something this app retrains on.
export function OverrideClassificationDialog({ open, onClose, response, onOverridden }: OverrideClassificationDialogProps) {
  const [tag, setTag] = useState<Tag | ''>('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTag(response?.tag ?? '')
      setNote('')
      setError(null)
    }
  }, [open, response?.tag])

  const canSubmit = !!tag && !!response && tag !== response.tag

  async function handleSubmit() {
    if (!canSubmit || !response) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/responses/${response.id}/override-tag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, note: note.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to override classification')
      }
      onOverridden()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to override classification')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="right-auto top-1/2 left-1/2 h-fit w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
        <DialogHeader>
          <DialogTitle>Override Classification</DialogTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Corrects the tag the classification pipeline assigned. Logged as an override, not silently changed.
          </p>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="override-tag-select" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Correct tag
            </label>
            <Select value={tag} onValueChange={(v) => setTag(v as Tag)}>
              <SelectTrigger id="override-tag-select" data-testid="override-tag-select">
                <SelectValue placeholder="Select a tag…" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TAG_CONFIG) as Tag[]).map((t) => (
                  <SelectItem key={t} value={t} data-testid={`override-tag-option-${t}`}>
                    {TAG_CONFIG[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="override-tag-note" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Reason (optional)
            </label>
            <Textarea
              id="override-tag-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Misread as a denial — broker actually confirmed removal"
              rows={3}
              className="min-h-[72px]"
              data-testid="override-tag-note"
            />
          </div>

          {error && (
            <p data-testid="override-tag-error" className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving} data-testid="override-tag-cancel">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || !canSubmit} data-testid="override-tag-submit">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TagIcon className="h-3.5 w-3.5" />}
            Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
