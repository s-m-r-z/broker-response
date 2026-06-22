'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { type BrokerResponse } from '@/lib/types'
import { EMAIL_TEMPLATES } from '@/lib/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

interface ComposeDrawerProps {
  open: boolean
  response: BrokerResponse | null
  onClose: () => void
  onSent: () => void
}

function buildBody(response: BrokerResponse): string {
  const template = EMAIL_TEMPLATES[response.tag]
  return `Dear ${response.brokerName},\n\n${template.body}\n\nBest regards,\nPureWL Compliance Team`
}

export function ComposeDrawer({ open, response, onClose, onSent }: ComposeDrawerProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (response) {
      setTo(response.brokerEmail)
      setSubject(EMAIL_TEMPLATES[response.tag].subject)
      setBody(buildBody(response))
    }
    setError(null)
  }, [response])

  async function handleSend() {
    if (!response || !to || !subject || !body) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: response.id, to, subject, body }),
      })
      if (!res.ok) throw new Error(await res.text())
      onSent()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex flex-col h-full">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          {response && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Re: {response.brokerName} · {response.tag.replace(/_/g, ' ')}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">To</label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="broker@example.com" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="min-h-[240px]"
              placeholder="Message body…"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sending || !to || !subject || !body}>
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
