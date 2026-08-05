'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Scale,
  CheckCircle2,
  Send,
  Clock,
  Loader2,
  Inbox,
  Globe,
  MapPin,
  Tag as TagIcon,
  Gavel,
  UserPlus,
} from 'lucide-react'
import { type BrokerResponse, type ActionLog, type Case } from '@/lib/types'
import { TagBadge } from './tag-badge'
import { StatusBadge } from './status-badge'
import { AssigneeBadge } from './assignee-badge'
import { HoldingReplyBadge } from './holding-reply-badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { ACTION_LABELS, ACTION_ICON_CONFIG, STAKEHOLDER_CONFIG } from '@/lib/constants'
import { RelevantLawPanel } from './legal-workbook/relevant-law-panel'

interface ResponseDetailProps {
  response: BrokerResponse | null
  onCompose: (insertText?: string) => void
  onStatusChange: (status: string) => Promise<void>
  onTrackCase: () => void
  onAssign: () => void
  onOverrideClassification: () => void
}

export function ResponseDetail({ response, onCompose, onStatusChange, onTrackCase, onAssign, onOverrideClassification }: ResponseDetailProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [linkedCase, setLinkedCase] = useState<Case | null>(null)

  useEffect(() => {
    setLinkedCase(null)
    if (!response) return
    fetch(`/api/cases?sourceResponseId=${response.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Case[] | null) => setLinkedCase(data?.[0] ?? null))
  }, [response?.id])

  async function handle(action: string) {
    setLoadingAction(action)
    await onStatusChange(action)
    setLoadingAction(null)
  }

  if (!response) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white text-zinc-400 dark:bg-zinc-950 dark:text-zinc-600">
        <Inbox className="h-10 w-10" />
        <p className="text-sm">Select a response to view details</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{response.brokerName}</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{response.brokerEmail}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <TagBadge tag={response.tag} />
            <StatusBadge status={response.status} />
            {response.assignedTo && <AssigneeBadge assignedTo={response.assignedTo} />}
            {response.isHoldingReply && <HoldingReplyBadge />}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {response.website && (
            <a
              href={response.website.startsWith('http') ? response.website : `https://${response.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
              {response.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {response.jurisdiction && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
              {response.jurisdiction}
            </span>
          )}
          {response.category && (
            <span className="flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
              {response.category}
            </span>
          )}
          {(response.website || response.jurisdiction || response.category) && (
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
          )}
          {response.tier && (
            <span className="capitalize">{response.tier.replace('_', ' ')}</span>
          )}
          <span>{formatDate(response.createdAt)}</span>
        </div>
      </div>

      {/* Actions — status-changing actions and meta actions (assign/reclassify)
          are visually grouped separately so the row reads as two clusters
          rather than one undifferentiated overflow (design audit finding #4). */}
      <div className="border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onCompose()} data-testid="response-action-email">
          <Mail className="h-3.5 w-3.5" />
          Email Broker
        </Button>

        <Button
          size="sm"
          variant="legal"
          onClick={() => handle('ESCALATED_TO_LEGAL')}
          disabled={!!loadingAction || response.status === 'ESCALATED_TO_LEGAL'}
          data-testid="response-action-escalate"
        >
          {loadingAction === 'ESCALATED_TO_LEGAL' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Scale className="h-3.5 w-3.5" />
          )}
          Escalate to Legal
        </Button>

        <Button
          size="sm"
          variant="warning"
          onClick={() => handle('RE_SENT')}
          disabled={!!loadingAction || response.status === 'RE_SENT'}
          data-testid="response-action-resend"
        >
          {loadingAction === 'RE_SENT' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Re-send Request
        </Button>

        <Button
          size="sm"
          variant="success"
          onClick={() => handle('RESOLVED')}
          disabled={!!loadingAction || response.status === 'RESOLVED'}
          data-testid="response-action-resolve"
        >
          {loadingAction === 'RESOLVED' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Mark Resolved
        </Button>

        {linkedCase ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/case-tracker?open=${linkedCase.id}`)}
            title="Open the case already being tracked for this response"
            data-testid="response-action-view-case"
          >
            <Gavel className="h-3.5 w-3.5" />
            View Case
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onTrackCase} title="Open the case tracker to escalate this non-response" data-testid="response-action-track-case">
            <Gavel className="h-3.5 w-3.5" />
            Track as Case
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-800">
        <Button
          size="sm"
          variant="outline"
          onClick={onAssign}
          title="Assign this response to a stakeholder for follow-up"
          data-testid="response-action-assign"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {response.assignedTo ? 'Reassign' : 'Assign'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onOverrideClassification}
          title="Correct this response's classification tag"
          data-testid="response-action-override-classification"
        >
          <TagIcon className="h-3.5 w-3.5" />
          Reclassify
        </Button>
      </div>
      </div>

      {/* Response content + action history */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
            Broker Response
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap dark:text-zinc-300">
              {response.responseContent}
            </p>
          </div>
        </div>

        <RelevantLawPanel jurisdiction={response.jurisdiction} onInsertCitation={onCompose} />

        {response.actions.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 dark:text-zinc-600">
              Action History
            </p>
            <div className="space-y-2">
              {response.actions.map((action) => (
                <ActionItem key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionItem({ action }: { action: ActionLog }) {
  const iconConfig = ACTION_ICON_CONFIG[action.type]
  const Icon = iconConfig?.icon ?? Clock
  const label =
    action.type === 'ASSIGNED' && action.assignedTo
      ? `Assigned to ${STAKEHOLDER_CONFIG[action.assignedTo].label}`
      : ACTION_LABELS[action.type] ?? action.type

  return (
    <div data-testid={`action-history-item-${action.id}`} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', iconConfig?.color ?? 'text-zinc-900 dark:text-zinc-100')} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </p>
        {action.emailTo && (
          <p className="text-xs text-zinc-500 mt-0.5">To: {action.emailTo}</p>
        )}
        {action.emailSubject && (
          <p className="text-xs text-zinc-500">Subject: {action.emailSubject}</p>
        )}
        {action.note && (
          <p className="text-xs text-zinc-600 mt-1 dark:text-zinc-400">{action.note}</p>
        )}
        <p className="text-[10px] text-zinc-400 mt-1 dark:text-zinc-600">{formatRelativeTime(action.createdAt)}</p>
      </div>
    </div>
  )
}
