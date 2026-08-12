'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, CheckCircle2, TriangleAlert, ExternalLink, ClipboardCheck, FileText, Scale, Lock } from 'lucide-react'
import { type Case, type DraftInsertion } from '@/lib/types'
import { flagBroadLanguage, findUnresolvedPlaceholders } from '@/lib/draft-flagging'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

interface DraftReplyPanelProps {
  kase: Case
  onSaved: () => Promise<void>
  onOpenStructuredConfirmation: () => void
}

function parseInsertions(raw: string | null): DraftInsertion[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// The Draft Reply workflow (US-13/US-15/US-20/US-25): an editable body with
// a snippet library of prior cases' drafts to start from, inline-flagged
// broad/commitment language with one-click fixes, a sources panel showing
// what was inserted from where, and an approval step gating filing. Modeled
// on Gorgias's inline reply composer (not a separate drawer) plus Writer's
// combined suggestions+snippets sidebar — see conversation with the user
// for the Mobbin research this was based on.
export function DraftReplyPanel({ kase, onSaved, onOpenStructuredConfirmation }: DraftReplyPanelProps) {
  const router = useRouter()
  const [draftText, setDraftText] = useState(kase.draftReply ?? '')
  const [saving, setSaving] = useState(false)
  const [reviewerName, setReviewerName] = useState('')
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insertions = useMemo(() => parseInsertions(kase.draftInsertions), [kase.draftInsertions])
  const flags = useMemo(() => flagBroadLanguage(draftText), [draftText])
  const placeholders = useMemo(() => findUnresolvedPlaceholders(draftText), [draftText])

  // Closing a case (evidence checklist complete) is meant to make the whole
  // case read-only, not just lock the evidence checklist — mirrors the lock
  // shown there (see evidence-checklist.tsx). Every mutation this panel can
  // trigger is also blocked server-side (assertNotClosed in lib/case-tracker.ts).
  const locked = !!kase.closedAt
  const unsaved = draftText !== (kase.draftReply ?? '')
  const isApproved = !!kase.approvedDraftText && kase.approvedDraftText === kase.draftReply
  const approvalStale = !!kase.approvedDraftText && kase.approvedDraftText !== kase.draftReply

  async function saveDraft(nextText: string, nextInsertions?: DraftInsertion[]) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cases/${kase.id}/draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftReply: nextText, draftInsertions: nextInsertions ?? insertions }),
      })
      if (!res.ok) throw new Error('Failed to save draft')
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  function handleInsertSnippet(snippet: Case) {
    const separator = draftText.trim() ? '\n\n' : ''
    const nextText = `${draftText}${separator}${snippet.draftReply ?? ''}`
    const nextInsertions: DraftInsertion[] = [
      ...insertions,
      {
        id: `${Date.now()}`,
        source: 'PRIOR_CASE',
        label: snippet.brokerName,
        sourceCaseId: snippet.id,
        text: snippet.draftReply ?? '',
      },
    ]
    setDraftText(nextText)
    saveDraft(nextText, nextInsertions)
  }

  function handleReplacePhrase(phrase: string, suggestion: string) {
    const nextText = draftText.replace(phrase, suggestion)
    setDraftText(nextText)
    saveDraft(nextText)
  }

  async function handleApprove() {
    if (!reviewerName.trim()) return
    setApproving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cases/${kase.id}/approve-draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName: reviewerName.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to approve draft')
      }
      setReviewerName('')
      await onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve draft')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Draft Reply
        </p>
        {isApproved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved by {kase.approvedBy} {formatRelativeTime(kase.approvedAt!)}
          </span>
        ) : approvalStale ? (
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <TriangleAlert className="h-3.5 w-3.5" />
            Changed since approval — re-approve required
          </span>
        ) : (
          <span className="text-xs text-zinc-400">Not yet approved</span>
        )}
      </div>

      {locked && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-zinc-500" data-testid="draft-locked-notice">
          <Lock className="h-3.5 w-3.5" />
          Case closed {formatRelativeTime(kase.closedAt!)} — draft is read-only.
        </p>
      )}

      <Textarea
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        placeholder="Draft the reply to file with the complaint — or insert a prior case's reply below to start from precedent."
        rows={8}
        disabled={locked}
        data-testid="draft-reply-textarea"
      />

      {!locked && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {saving ? 'Saving…' : unsaved ? 'Unsaved changes' : kase.draftReply ? 'Saved' : ''}
          </span>
          <Button size="sm" variant="outline" disabled={saving || !unsaved} onClick={() => saveDraft(draftText)} data-testid="draft-save-button">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </Button>
        </div>
      )}

      {placeholders.length > 0 && (
        <p className="mt-2 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400" data-testid="draft-placeholder-warning">
          Unresolved placeholders: {placeholders.join(', ')} — resolve before this reply can be sent.
        </p>
      )}

      {/* Snippet library (US-13) */}
      {!locked && <SnippetLibrary kase={kase} onInsert={handleInsertSnippet} />}

      {/* Broad-language flags (US-15) */}
      {flags.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Flagged Language ({flags.length})
          </p>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <div key={i} data-testid={`draft-flag-${i}`} className="rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">"{flag.phrase}"</p>
                <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">{flag.reason}</p>
                {!locked && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1.5"
                    onClick={() => handleReplacePhrase(flag.phrase, flag.suggestion)}
                    data-testid={`draft-flag-replace-${i}`}
                  >
                    Replace with "{flag.suggestion}"
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources panel (US-20) */}
      {insertions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Sources
          </p>
          <div className="space-y-1.5">
            {insertions.map((insertion) => (
              <div key={insertion.id} data-testid={`draft-source-${insertion.id}`} className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-900">
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="rounded border border-zinc-300 px-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:border-zinc-700">
                    {insertion.source === 'PRIOR_CASE' ? 'Prior Case' : 'Template'}
                  </span>
                  {insertion.label}
                </span>
                {insertion.sourceCaseId && (
                  <button
                    onClick={() => router.push(`/case-tracker?open=${insertion.sourceCaseId}`)}
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
                    data-testid={`draft-source-open-${insertion.id}`}
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!locked && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <Input
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Reviewer name"
            data-testid="draft-reviewer-name"
            className="h-8 w-40 text-xs"
          />
          <Button
            size="sm"
            disabled={approving || unsaved || !draftText.trim() || !reviewerName.trim()}
            onClick={handleApprove}
            title={unsaved ? 'Save your changes before approving' : undefined}
            data-testid="draft-approve-button"
          >
            {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardCheck className="h-3.5 w-3.5" />}
            Approve for Filing
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenStructuredConfirmation} data-testid="draft-open-structured-confirmation">
            <Scale className="h-3.5 w-3.5" />
            Request Structured Confirmation
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function SnippetLibrary({ kase, onInsert }: { kase: Case; onInsert: (snippet: Case) => void }) {
  const [snippets, setSnippets] = useState<Case[] | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ jurisdictionCountry: kase.userCountry, excludeId: kase.id, hasDraft: 'true' })
    if (kase.userState) params.set('jurisdictionState', kase.userState)
    fetch(`/api/cases?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Case[] | null) => setSnippets(data ?? []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kase.id, kase.userCountry, kase.userState])

  if (!snippets || snippets.length === 0) return null

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
        Start From Precedent
      </p>
      <div className="space-y-1.5">
        {snippets.map((snippet) => (
          <div key={snippet.id} data-testid={`draft-snippet-${snippet.id}`} className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 px-2.5 py-1.5 dark:border-zinc-800">
            <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">{snippet.brokerName}</span>
            <Button size="sm" variant="outline" onClick={() => onInsert(snippet)} data-testid={`draft-snippet-insert-${snippet.id}`}>
              Insert
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
