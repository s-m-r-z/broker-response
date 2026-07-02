'use client'

import { Search, RefreshCw } from 'lucide-react'
import { type BrokerResponse, type Bucket, type Tag } from '@/lib/types'
import { BUCKET_TAGS } from '@/lib/constants'
import { TagBadge } from './tag-badge'
import { StatusBadge } from './status-badge'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'

interface ResponseListProps {
  responses: BrokerResponse[]
  loading: boolean
  selectedId: string | null
  selectedIds: string[]
  search: string
  activeBucket: Bucket
  activeTag: Tag | null
  onSelect: (response: BrokerResponse) => void
  onToggleCheck: (id: string) => void
  onToggleAll: () => void
  onSearch: (q: string) => void
  onRefresh: () => void
}

export function ResponseList({
  responses,
  loading,
  selectedId,
  selectedIds,
  search,
  activeBucket,
  activeTag,
  onSelect,
  onToggleCheck,
  onToggleAll,
  onSearch,
  onRefresh,
}: ResponseListProps) {
  const allChecked = responses.length > 0 && selectedIds.length === responses.length
  const someChecked = selectedIds.length > 0 && !allChecked

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 px-3 py-3 space-y-2 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {activeTag
              ? responses.length > 0
                ? `${responses.length} responses`
                : 'No responses'
              : activeBucket === 'all'
              ? 'All Responses'
              : activeBucket.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <button
            onClick={onRefresh}
            className="text-zinc-400 hover:text-zinc-600 transition-colors dark:text-zinc-500 dark:hover:text-zinc-300"
            title="Refresh"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search broker, tag…"
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Select all row */}
      {responses.length > 0 && (
        <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <Checkbox
            checked={allChecked}
            data-state={someChecked ? 'indeterminate' : allChecked ? 'checked' : 'unchecked'}
            onCheckedChange={onToggleAll}
          />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm dark:text-zinc-600">
            Loading…
          </div>
        ) : responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600">
            <p className="text-sm">No responses found</p>
          </div>
        ) : (
          responses.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelect(r)}
              className={cn(
                'group flex cursor-pointer flex-col gap-1 border-b border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-900',
                selectedId === r.id && 'bg-zinc-50 border-l-2 border-l-blue-600 dark:bg-zinc-900'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onCheckedChange={() => onToggleCheck(r.id)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.brokerName}</p>
                    <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600">{formatRelativeTime(r.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{r.brokerEmail}</p>
                  {(r.website || r.jurisdiction || r.category) && (
                    <p className="mt-0.5 truncate text-[10px] text-zinc-400 dark:text-zinc-600">
                      {[r.website, r.jurisdiction, r.category].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <TagBadge tag={r.tag} />
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400 leading-relaxed dark:text-zinc-500">
                    {r.responseContent}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
