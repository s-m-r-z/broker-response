'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { type Case } from '@/lib/types'
import { EVIDENCE_ITEMS, EVIDENCE_ITEM_FIELD, getMissingEvidenceItems, type EvidenceItem } from '@/lib/case-tracker'
import { EVIDENCE_ITEM_CONFIG } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface EvidenceChecklistProps {
  kase: Case
  onConfirmItem: (item: EvidenceItem, note?: string) => Promise<void>
  onClose: () => Promise<{ error?: string } | void>
}

// The completeness checklist gating case closure (US-19/US-21) — pattern
// modeled on compliance-checklist UIs like Vanta's "Prepare evidence" and
// Deel's compliance-documents tracker: per-item confirm state, a completed
// count, and a gated final action disabled until every item is confirmed.
export function EvidenceChecklist({ kase, onConfirmItem, onClose }: EvidenceChecklistProps) {
  const [confirming, setConfirming] = useState<EvidenceItem | null>(null)
  const [retentionNote, setRetentionNote] = useState('')
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState<string | null>(null)

  const missing = getMissingEvidenceItems(kase)
  const confirmedCount = EVIDENCE_ITEMS.length - missing.length

  async function handleConfirm(item: EvidenceItem) {
    setConfirming(item)
    await onConfirmItem(item, item === 'retentionException' ? retentionNote.trim() : undefined)
    setConfirming(null)
    setRetentionNote('')
  }

  async function handleClose() {
    setClosing(true)
    setCloseError(null)
    const result = await onClose()
    if (result?.error) setCloseError(result.error)
    setClosing(false)
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Evidence Checklist
        </p>
        <span className="text-xs text-zinc-500">
          {confirmedCount} of {EVIDENCE_ITEMS.length} complete
        </span>
      </div>

      <div className="space-y-2">
        {EVIDENCE_ITEMS.map((item) => {
          const config = EVIDENCE_ITEM_CONFIG[item]
          const Icon = config.icon
          const confirmedAt = kase[EVIDENCE_ITEM_FIELD[item] as keyof Case] as string | null

          return (
            <div key={item} data-testid={`evidence-item-${item}`} className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-100" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{config.label}</p>
                    <p className="text-[11px] text-zinc-500">{config.description}</p>
                    {item === 'retentionException' && kase.evidenceRetentionNote && (
                      <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">"{kase.evidenceRetentionNote}"</p>
                    )}
                    {/* This row needs a value, not just a click, so it's called out —
                        otherwise the extra input field reads as a layout glitch next
                        to the four button-only rows (design audit finding #7). */}
                    {item === 'retentionException' && !confirmedAt && (
                      <p className="mt-1 text-[11px] italic text-zinc-400 dark:text-zinc-500">Requires a note to confirm →</p>
                    )}
                  </div>
                </div>

                {confirmedAt ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed {formatRelativeTime(confirmedAt)}
                  </span>
                ) : item === 'retentionException' ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Input
                      value={retentionNote}
                      onChange={(e) => setRetentionNote(e.target.value)}
                      placeholder="Exception, or “None”"
                      data-testid="evidence-retention-note"
                      className="h-7 w-36 text-[11px]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!!confirming || !retentionNote.trim()}
                      onClick={() => handleConfirm(item)}
                      data-testid="evidence-confirm-retentionException"
                    >
                      {confirming === item ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Confirm
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!confirming}
                    onClick={() => handleConfirm(item)}
                    data-testid={`evidence-confirm-${item}`}
                  >
                    {confirming === item ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        {kase.closedAt ? (
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Lock className="h-3.5 w-3.5" />
            Case closed {formatRelativeTime(kase.closedAt)} — evidence record locked.
          </p>
        ) : (
          <>
            <Button
              size="sm"
              disabled={closing || missing.length > 0}
              onClick={handleClose}
              title={missing.length > 0 ? `Missing: ${missing.map((m) => EVIDENCE_ITEM_CONFIG[m].label).join(', ')}` : undefined}
              data-testid="case-close-button"
            >
              {closing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              Close Case
            </Button>
            {missing.length > 0 && (
              <p className="mt-2 text-xs text-amber-500">
                Missing: {missing.map((m) => EVIDENCE_ITEM_CONFIG[m].label).join(', ')}
              </p>
            )}
            {closeError && (
              <p className="mt-2 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {closeError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
