'use client'

import { useState } from 'react'
import { Inbox, MapPin, Calendar, ShieldCheck, Gavel, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react'
import { type Case } from '@/lib/types'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { StagePipeline } from './stage-pipeline'
import { RegimeBadge } from './regime-badge'

interface CaseDetailProps {
  kase: Case | null
  onConfirmJurisdiction: (id: string) => Promise<void>
  onConfirmAuthority: (id: string) => Promise<void>
}

export function CaseDetail({ kase, onConfirmJurisdiction, onConfirmAuthority }: CaseDetailProps) {
  const [confirming, setConfirming] = useState<'jurisdiction' | 'authority' | null>(null)

  if (!kase) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600">
        <Inbox className="h-10 w-10" />
        <p className="text-sm">Select a case to view details</p>
      </div>
    )
  }

  async function handleConfirmJurisdiction() {
    setConfirming('jurisdiction')
    await onConfirmJurisdiction(kase!.id)
    setConfirming(null)
  }

  async function handleConfirmAuthority() {
    setConfirming('authority')
    await onConfirmAuthority(kase!.id)
    setConfirming(null)
  }

  const complaintHref = kase.complaintUrl.startsWith('http') ? kase.complaintUrl : `https://${kase.complaintUrl}`

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{kase.brokerName}</h2>
            <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {kase.userState ? `${kase.userState}, ${kase.userCountry}` : kase.userCountry}
            </p>
          </div>
          <RegimeBadge regime={kase.applicableRegime} />
        </div>

        <div className="mt-4">
          <StagePipeline stage={kase.enforcementStage} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Case info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
              Case Details
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Broker country</dt>
                <dd className="text-zinc-700 dark:text-zinc-300">{kase.brokerCountry}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1 text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" /> Request sent
                </dt>
                <dd className="text-zinc-700 dark:text-zinc-300">{formatDate(kase.removalRequestDate)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1 text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" /> Response deadline
                </dt>
                <dd className="text-zinc-700 dark:text-zinc-300">{formatDate(kase.responseDeadlineDate)}</dd>
              </div>
            </dl>
          </div>

          {/* Jurisdiction & authority confirmation */}
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
              Confirmations
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Jurisdiction
                </span>
                {kase.jurisdictionConfirmedAt ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed {formatRelativeTime(kase.jurisdictionConfirmedAt)}
                  </span>
                ) : (
                  <Button size="sm" variant="outline" disabled={!!confirming} onClick={handleConfirmJurisdiction} data-testid="confirm-jurisdiction-button">
                    {confirming === 'jurisdiction' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Confirm
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <Gavel className="h-3.5 w-3.5" />
                  Authority
                </span>
                {kase.authorityConfirmedAt ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed {formatRelativeTime(kase.authorityConfirmedAt)}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!confirming || !kase.jurisdictionConfirmedAt}
                    onClick={handleConfirmAuthority}
                    title={!kase.jurisdictionConfirmedAt ? 'Confirm jurisdiction first' : undefined}
                    data-testid="confirm-authority-button"
                  >
                    {confirming === 'authority' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complaint pack */}
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
            Complaint Pack
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">Filing authority</dt>
              <dd className="text-zinc-700 dark:text-zinc-300">{kase.filingAuthority}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">Complaint URL</dt>
              <dd>
                <a
                  href={complaintHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  {kase.complaintUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">Max fine</dt>
              <dd className="text-right text-zinc-700 dark:text-zinc-300">{kase.maxFine}</dd>
            </div>
          </dl>
          {(!kase.jurisdictionConfirmedAt || !kase.authorityConfirmedAt) && (
            <p className="mt-3 text-xs text-amber-500">
              Confirm jurisdiction and authority above before filing this complaint.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
