'use client'

import { useState } from 'react'
import {
  Mail,
  Scale,
  CheckCircle2,
  Send,
  Clock,
  Loader2,
  Inbox,
} from 'lucide-react'
import { type BrokerResponse, type ActionLog } from '@/lib/types'
import { TagBadge } from './tag-badge'
import { StatusBadge } from './status-badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface ResponseDetailProps {
  response: BrokerResponse | null
  onCompose: () => void
  onStatusChange: (status: string) => Promise<void>
}

const ACTION_LABELS: Record<string, string> = {
  EMAIL_SENT: 'Email sent',
  ESCALATED_TO_LEGAL: 'Escalated to legal',
  MARKED_RESOLVED: 'Marked resolved',
  RE_SENT: 'Re-sent request',
  NOTE_ADDED: 'Note added',
}

export function ResponseDetail({ response, onCompose, onStatusChange }: ResponseDetailProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

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
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-600">
          {response.tier && (
            <span className="capitalize">{response.tier.replace('_', ' ')}</span>
          )}
          <span>{formatDate(response.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center gap-2 dark:border-zinc-800">
        <Button size="sm" onClick={onCompose}>
          <Mail className="h-3.5 w-3.5" />
          Email Broker
        </Button>

        <Button
          size="sm"
          variant="legal"
          onClick={() => handle('ESCALATED_TO_LEGAL')}
          disabled={!!loadingAction || response.status === 'ESCALATED_TO_LEGAL'}
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
          variant="outline"
          onClick={() => handle('RE_SENT')}
          disabled={!!loadingAction || response.status === 'RE_SENT'}
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
          variant="ghost"
          onClick={() => handle('RESOLVED')}
          disabled={!!loadingAction || response.status === 'RESOLVED'}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10"
        >
          {loadingAction === 'RESOLVED' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Mark Resolved
        </Button>
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
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-600" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {ACTION_LABELS[action.type] ?? action.type}
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
