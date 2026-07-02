'use client'

import { type Bucket, type Tag } from '@/lib/types'
import { TAG_CONFIG, BUCKET_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeBucket: Bucket
  activeTag: Tag | null
  onBucketSelect: (bucket: Bucket) => void
  onTagSelect: (tag: Tag | null) => void
  counts: { byTag: Record<Tag, number>; byBucket: Record<Bucket, number> } | null
}

export function Sidebar({ activeBucket, activeTag, onBucketSelect, onTagSelect, counts }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Broker Response</p>
        <p className="text-[10px] text-zinc-500">PureWL Compliance</p>
      </div>

      {/* Buckets */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Buckets
        </p>
        {(Object.keys(BUCKET_CONFIG) as Bucket[]).map((bucketId) => {
          const config = BUCKET_CONFIG[bucketId]
          const Icon = config.icon
          const isActive = activeBucket === bucketId && activeTag === null
          return (
            <button
              key={bucketId}
              onClick={() => { onBucketSelect(bucketId); onTagSelect(null) }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? config.color : '')} />
              <span className="flex-1 text-left">{config.label}</span>
              {counts && (counts.byBucket[bucketId] ?? 0) > 0 && (
                <span className="text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600">
                  {counts.byBucket[bucketId].toLocaleString()}
                </span>
              )}
            </button>
          )
        })}

        {/* Individual tags */}
        <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
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
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.bgColor, 'border', config.borderColor)} />
              <span className={cn('flex-1 text-left', isActive ? config.color : '')}>{config.label}</span>
              {counts && (counts.byTag[tag] ?? 0) > 0 && (
                <span className="text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600">
                  {counts.byTag[tag].toLocaleString()}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
