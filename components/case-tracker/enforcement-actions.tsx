'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { type Case } from '@/lib/types'
import { canTransitionStage, getNextStage, type EnforcementStage } from '@/lib/case-tracker'
import { STAGE_CONFIG } from '@/lib/constants'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface EnforcementActionsProps {
  kase: Case
  onAdvance: (id: string, note?: string) => Promise<{ error?: string } | void>
  insertCitation: { text: string; nonce: number } | null
}

// Labeled by the stage being *reached*, not the current one — this is what
// the compliance officer is about to do, phrased as an action rather than a
// state name (mirrors "Mark Resolved" / "Re-send Request" on the broker
// response action bar).
const ADVANCE_LABELS: Record<EnforcementStage, string> = {
  request_sent: 'Request Sent',
  deadline_approaching: 'Mark Deadline Approaching',
  deadline_passed: 'Mark Deadline Passed',
  followup_sent: 'Send Follow-up',
  complaint_eligible: 'Mark Complaint Eligible',
  complaint_filed: 'File Complaint',
}

export function EnforcementActions({ kase, onAdvance, insertCitation }: EnforcementActionsProps) {
  const [note, setNote] = useState('')
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!insertCitation) return
    setNote((prev) => (prev ? `${prev}\n\n${insertCitation.text}` : insertCitation.text))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insertCitation])

  const nextStage = getNextStage(kase.enforcementStage)

  if (!nextStage) {
    return (
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
          Enforcement
        </p>
        <p className="flex items-center gap-1.5 text-sm text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          Enforcement complete — this case has reached the end of the pipeline.
        </p>
      </div>
    )
  }

  const precheck = canTransitionStage({
    currentStage: kase.enforcementStage,
    targetStage: nextStage,
    jurisdictionConfirmedAt: kase.jurisdictionConfirmedAt ? new Date(kase.jurisdictionConfirmedAt) : null,
    authorityConfirmedAt: kase.authorityConfirmedAt ? new Date(kase.authorityConfirmedAt) : null,
  })

  async function handleAdvance() {
    setAdvancing(true)
    setError(null)
    const result = await onAdvance(kase.id, note.trim() || undefined)
    if (result?.error) {
      setError(result.error)
    } else {
      setNote('')
    }
    setAdvancing(false)
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
        Enforcement
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{STAGE_CONFIG[kase.enforcementStage].description}</p>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="min-h-[60px] mb-3"
        data-testid="case-advance-note"
      />

      <Button
        size="sm"
        disabled={advancing || !precheck.ok}
        onClick={handleAdvance}
        title={!precheck.ok ? precheck.error : undefined}
        data-testid="case-advance-button"
      >
        {advancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {ADVANCE_LABELS[nextStage]}
      </Button>

      {!precheck.ok && (
        <p className="mt-2 text-xs text-amber-500">{precheck.error}</p>
      )}
      {error && (
        <p className="mt-2 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
