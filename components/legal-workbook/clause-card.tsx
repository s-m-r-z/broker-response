'use client'

import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { type LawClause } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ClauseCategoryBadge } from './clause-category-badge'
import { Callout } from './callout'
import { Button } from '../ui/button'

interface ClauseCardProps {
  clause: LawClause
  onToggleVerified: (id: string, verified: boolean) => Promise<void>
  onReviewChange: (changeId: string, action: 'accept' | 'reject') => Promise<void>
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
        verified
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      )}
    >
      {verified ? 'Verified' : 'AI-Drafted · Unverified'}
    </span>
  )
}

export function ClauseCard({ clause, onToggleVerified, onReviewChange }: ClauseCardProps) {
  const [busy, setBusy] = useState(false)
  const pending = clause.pendingChanges.find((c) => c.status === 'PENDING')

  async function handleVerifyToggle() {
    setBusy(true)
    await onToggleVerified(clause.id, !clause.verified)
    setBusy(false)
  }

  async function handleReview(action: 'accept' | 'reject') {
    if (!pending) return
    setBusy(true)
    await onReviewChange(pending.id, action)
    setBusy(false)
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <ClauseCategoryBadge category={clause.category} />
            <VerifiedBadge verified={clause.verified} />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{clause.title}</h4>
          <p className="text-xs text-zinc-500 mt-0.5">{clause.citation}</p>
        </div>
        <Button size="sm" variant={clause.verified ? 'outline' : 'secondary'} disabled={busy} onClick={handleVerifyToggle}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {clause.verified ? 'Unverify' : 'Mark Verified'}
        </Button>
      </div>

      <p className="mt-3 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap dark:text-zinc-300">
        {clause.text}
      </p>

      {pending && (
        <Callout variant="warning" title="Proposed change — pending review" className="mt-3">
          <p className="mb-2">{pending.changeSummary}</p>
          <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {pending.proposedText}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="success" disabled={busy} onClick={() => handleReview('accept')}>
              <Check className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => handleReview('reject')}>
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        </Callout>
      )}
    </div>
  )
}
