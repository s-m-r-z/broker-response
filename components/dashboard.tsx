'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { type BrokerResponse, type Bucket, type Tag } from '@/lib/types'
import { BUCKET_TAGS, BUCKET_CONFIG } from '@/lib/constants'

interface Counts {
  byTag: Record<Tag, number>
  byBucket: Record<Bucket, number>
}
import { NavRail } from './nav-rail'
import { Sidebar } from './sidebar'
import { ResponseList } from './response-list'
import { ResponseDetail } from './response-detail'
import { ComposeDrawer } from './compose-drawer'
import { BulkActionBar } from './bulk-action-bar'

export function Dashboard() {
  const searchParams = useSearchParams()
  const [responses, setResponses] = useState<BrokerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBucket, setActiveBucket] = useState<Bucket>('all')
  const [activeTag, setActiveTag] = useState<Tag | null>(null)
  const [search, setSearch] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<BrokerResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [composeOpen, setComposeOpen] = useState(false)
  const [insertCitation, setInsertCitation] = useState<{ text: string; nonce: number } | null>(null)
  const [counts, setCounts] = useState<Counts | null>(null)

  const fetchCounts = useCallback(async () => {
    const res = await fetch('/api/counts')
    if (res.ok) setCounts(await res.json())
  }, [])

  const fetchResponses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeTag) {
      params.set('tag', activeTag)
    } else if (activeBucket !== 'all') {
      const tags = BUCKET_TAGS[activeBucket]
      if (tags.length) params.set('tags', tags.join(','))
    }
    if (search) params.set('search', search)

    const res = await fetch(`/api/responses?${params}`)
    const data = await res.json()
    setResponses(data.data ?? [])
    setLoading(false)
  }, [activeBucket, activeTag, search])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // One-time deep-link support from the Home overview: ?bucket= preselects a bucket,
  // ?open= fetches and opens a specific response (e.g. from the recent activity feed).
  useEffect(() => {
    const bucket = searchParams.get('bucket')
    if (bucket && bucket in BUCKET_CONFIG) setActiveBucket(bucket as Bucket)

    const openId = searchParams.get('open')
    if (openId) {
      fetch(`/api/responses/${openId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setSelectedResponse(data))
    }
  }, [])

  async function refreshSelected(id: string) {
    await Promise.all([fetchResponses(), fetchCounts()])
    const res = await fetch(`/api/responses/${id}`)
    if (res.ok) {
      const updated = await res.json()
      setSelectedResponse(updated)
    }
  }

  function handleSelect(response: BrokerResponse) {
    setSelectedResponse(response)
    setSelectedIds([])
  }

  function handleToggleCheck(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    if (selectedResponse?.id === id) setSelectedResponse(null)
  }

  function handleToggleAll() {
    if (selectedIds.length === responses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(responses.map((r) => r.id))
      setSelectedResponse(null)
    }
  }

  async function handleStatusChange(status: string) {
    if (!selectedResponse) return
    await fetch(`/api/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseId: selectedResponse.id, action: status }),
    })
    await refreshSelected(selectedResponse.id)
  }

  async function handleBulkAction(action: 'RESOLVED' | 'ESCALATED_TO_LEGAL' | 'RE_SENT') {
    await Promise.all(
      selectedIds.map((id) =>
        fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responseId: id, action }),
        })
      )
    )
    setSelectedIds([])
    await Promise.all([fetchResponses(), fetchCounts()])
  }

  function handleComposeSent() {
    if (selectedResponse) refreshSelected(selectedResponse.id)
  }

  function handleCompose(insertText?: string) {
    if (insertText) setInsertCitation({ text: insertText, nonce: Date.now() })
    setComposeOpen(true)
  }

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 overflow-hidden dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex flex-1 overflow-hidden">
        <NavRail active="dashboard" />
        <Sidebar
          activeBucket={activeBucket}
          activeTag={activeTag}
          onBucketSelect={setActiveBucket}
          onTagSelect={setActiveTag}
          counts={counts}
        />

        <ResponseList
          responses={responses}
          loading={loading}
          selectedId={selectedResponse?.id ?? null}
          selectedIds={selectedIds}
          search={search}
          activeBucket={activeBucket}
          activeTag={activeTag}
          onSelect={handleSelect}
          onToggleCheck={handleToggleCheck}
          onToggleAll={handleToggleAll}
          onSearch={setSearch}
          onRefresh={fetchResponses}
        />

        <ResponseDetail
          response={selectedResponse}
          onCompose={handleCompose}
          onStatusChange={handleStatusChange}
        />
      </div>

      <ComposeDrawer
        open={composeOpen}
        response={selectedResponse}
        insertCitation={insertCitation}
        onClose={() => setComposeOpen(false)}
        onSent={handleComposeSent}
      />

      {selectedIds.length > 0 && (
        <BulkActionBar
          count={selectedIds.length}
          onClear={() => setSelectedIds([])}
          onBulkAction={handleBulkAction}
        />
      )}
    </div>
  )
}
