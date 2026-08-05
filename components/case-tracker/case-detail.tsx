'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox, MapPin, Calendar, ShieldCheck, Gavel, Loader2, ExternalLink, CheckCircle2, Clock, TriangleAlert } from 'lucide-react'
import { type Case, type CaseActionLog } from '@/lib/types'
import { type EvidenceItem } from '@/lib/case-tracker'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { STAGE_CONFIG, CASE_EVENT_CONFIG } from '@/lib/constants'
import { Button } from '../ui/button'
import { StagePipeline } from './stage-pipeline'
import { RegimeBadge } from './regime-badge'
import { DeadlineChip } from './deadline-chip'
import { EnforcementActions } from './enforcement-actions'
import { EvidenceChecklist } from './evidence-checklist'
import { RelatedCasesPanel } from './related-cases-panel'
import { DraftReplyPanel } from './draft-reply-panel'
import { StructuredConfirmationDialog } from './structured-confirmation-dialog'
import { CaseStatusBadge } from './case-status-badge'
import { RelevantLawPanel } from '../legal-workbook/relevant-law-panel'

interface CaseDetailProps {
  kase: Case | null
  onConfirmJurisdiction: (id: string) => Promise<void>
  onConfirmAuthority: (id: string) => Promise<void>
  onAdvanceStage: (id: string, note?: string) => Promise<{ error?: string } | void>
  onConfirmEvidence: (id: string, item: EvidenceItem, note?: string) => Promise<void>
  onCloseCase: (id: string) => Promise<{ error?: string } | void>
  onRefresh: () => Promise<void>
}

export function CaseDetail({ kase, onConfirmJurisdiction, onConfirmAuthority, onAdvanceStage, onConfirmEvidence, onCloseCase, onRefresh }: CaseDetailProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<'jurisdiction' | 'authority' | null>(null)
  const [insertCitation, setInsertCitation] = useState<{ text: string; nonce: number } | null>(null)
  const [structuredConfirmationOpen, setStructuredConfirmationOpen] = useState(false)

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

  async function handleOpenStructuredConfirmation() {
    await fetch(`/api/cases/${kase!.id}/request-confirmation`, { method: 'PATCH' })
    await onRefresh()
    setStructuredConfirmationOpen(true)
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
          <div className="flex items-center gap-2">
            <CaseStatusBadge status={kase.status} />
            <DeadlineChip deadline={kase.responseDeadlineDate} />
            <RegimeBadge regime={kase.applicableRegime} />
          </div>
        </div>

        <div className="mt-4">
          <StagePipeline stage={kase.enforcementStage} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {new Date(kase.responseDeadlineDate).getTime() < Date.now() && !kase.closedAt && (
          <div
            data-testid="case-overdue-banner"
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
          >
            <TriangleAlert className="h-4 w-4 shrink-0" />
            The response deadline passed on {formatDate(kase.responseDeadlineDate)} — this case is overdue and needs action.
          </div>
        )}

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
              {kase.sourceResponseId && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-500">Tracked from</dt>
                  <dd>
                    <button
                      onClick={() => router.push(`/responses?open=${kase.sourceResponseId}`)}
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                      data-testid="case-view-source-response"
                    >
                      View Original Response
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </dd>
                </div>
              )}
              {kase.contractFileRef && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-500">Reference document</dt>
                  <dd className="text-right text-zinc-700 dark:text-zinc-300" data-testid="case-contract-file-ref">{kase.contractFileRef}</dd>
                </div>
              )}
              {kase.dataFlowNote && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-500">Data flow note</dt>
                  <dd className="text-right text-zinc-700 dark:text-zinc-300">{kase.dataFlowNote}</dd>
                </div>
              )}
            </dl>
            {!kase.contractFileRef && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-500" data-testid="case-missing-contract-file">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                No reference document attached to this case.
              </p>
            )}
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

        <RelatedCasesPanel userCountry={kase.userCountry} userState={kase.userState} excludeId={kase.id} />

        <RelevantLawPanel
          jurisdiction={kase.userState ? `${kase.userState}, ${kase.userCountry}` : kase.userCountry}
          onInsertCitation={(text) => setInsertCitation({ text, nonce: Date.now() })}
        />

        <DraftReplyPanel
          key={kase.id}
          kase={kase}
          onSaved={onRefresh}
          onOpenStructuredConfirmation={handleOpenStructuredConfirmation}
        />

        {/* Enforcement actions */}
        <EnforcementActions kase={kase} onAdvance={onAdvanceStage} insertCitation={insertCitation} />

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

        <EvidenceChecklist
          kase={kase}
          onConfirmItem={(item, note) => onConfirmEvidence(kase.id, item, note)}
          onClose={() => onCloseCase(kase.id)}
        />

        {kase.actionLogs.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
              Case History
            </p>
            <div className="space-y-2">
              {kase.actionLogs.map((entry) => (
                <CaseHistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>

      <StructuredConfirmationDialog
        open={structuredConfirmationOpen}
        onClose={() => setStructuredConfirmationOpen(false)}
        caseId={kase.id}
        onConfirmed={async () => {
          setStructuredConfirmationOpen(false)
          await onRefresh()
        }}
      />
    </div>
  )
}

function CaseHistoryItem({ entry }: { entry: CaseActionLog }) {
  const config =
    entry.type === 'STAGE_ADVANCED' && entry.stage
      ? STAGE_CONFIG[entry.stage]
      : entry.type !== 'STAGE_ADVANCED'
        ? CASE_EVENT_CONFIG[entry.type]
        : null
  const Icon = config?.icon ?? Clock
  return (
    <div data-testid={`case-history-item-${entry.id}`} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-900 dark:text-zinc-100" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{config?.label ?? entry.type}</p>
        {entry.note && (
          <p className="text-xs text-zinc-600 mt-1 dark:text-zinc-400">{entry.note}</p>
        )}
        <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-600">{formatRelativeTime(entry.createdAt)}</p>
      </div>
    </div>
  )
}
