'use client'

import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  HelpCircle,
  Shield,
} from 'lucide-react'
import { type Bucket, type Tag } from '@/lib/types'
import { TAG_CONFIG, BUCKET_TAGS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeBucket: Bucket
  activeTag: Tag | null
  onBucketSelect: (bucket: Bucket) => void
  onTagSelect: (tag: Tag | null) => void
}

const BUCKETS: { id: Bucket; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Responses', icon: <Inbox className="h-4 w-4" /> },
  { id: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: 'needs-action', label: 'Needs Action', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'denied', label: 'Denied', icon: <XCircle className="h-4 w-4" /> },
  { id: 'no-action', label: 'No Action', icon: <Clock className="h-4 w-4" /> },
  { id: 'review', label: 'Review', icon: <HelpCircle className="h-4 w-4" /> },
]

const BUCKET_COLORS: Record<Bucket, string> = {
  all: 'text-blue-400',
  done: 'text-emerald-400',
  'needs-action': 'text-amber-400',
  denied: 'text-red-400',
  'no-action': 'text-zinc-400',
  review: 'text-violet-400',
}

export function Sidebar({ activeBucket, activeTag, onBucketSelect, onTagSelect }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-zinc-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Broker Response</p>
          <p className="text-[10px] text-zinc-500">PureWL Compliance</p>
        </div>
      </div>

      {/* Buckets */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Buckets
        </p>
        {BUCKETS.map((bucket) => {
          const isActive = activeBucket === bucket.id && activeTag === null
          const color = BUCKET_COLORS[bucket.id]
          return (
            <button
              key={bucket.id}
              onClick={() => { onBucketSelect(bucket.id); onTagSelect(null) }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              )}
            >
              <span className={isActive ? color : ''}>{bucket.icon}</span>
              {bucket.label}
            </button>
          )
        })}

        {/* Individual tags */}
        <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Tags
        </p>
        {(Object.entries(TAG_CONFIG) as [Tag, typeof TAG_CONFIG[Tag]][]).map(([tag, config]) => {
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => { onTagSelect(tag); onBucketSelect(config.bucket) }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.bgColor, 'border', config.borderColor)} />
              <span className={isActive ? config.color : ''}>{config.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
