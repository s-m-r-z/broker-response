'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, FileWarning, Globe2 } from 'lucide-react'
import { type Bucket, type Tag, type LawRegime, type RecentActivityItem } from '@/lib/types'
import { BUCKET_CONFIG, ACTION_LABELS, ACTION_ICON_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { NavRail } from '../nav-rail'
import { StatCard } from './stat-card'
import { ProgressStatCard } from './progress-stat-card'
import { TagBreakdown } from './tag-breakdown'

interface Counts {
  byTag: Record<Tag, number>
  byBucket: Record<Bucket, number>
}

export function HomeOverview() {
  const router = useRouter()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [regimes, setRegimes] = useState<LawRegime[]>([])
  const [activity, setActivity] = useState<RecentActivityItem[]>([])

  useEffect(() => {
    fetch('/api/counts').then((r) => r.json()).then(setCounts)
    fetch('/api/legal/regimes').then((r) => r.json()).then(setRegimes)
    fetch('/api/activity').then((r) => r.json()).then(setActivity)
  }, [])

  const totalClauses = regimes.reduce((n, r) => n + r.clauses.length, 0)
  const verifiedClauses = regimes.reduce(
    (n, r) => n + r.clauses.filter((c) => c.verified).length,
    0
  )
  const pendingReview = regimes.reduce(
    (n, r) => n + r.clauses.reduce((m, c) => m + c.pendingChanges.filter((p) => p.status === 'PENDING').length, 0),
    0
  )

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <NavRail active="home" />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <header className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Overview</h1>
          <p className="text-sm text-zinc-500">PureWL Compliance · broker response triage &amp; legal reference</p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            At a Glance
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label={BUCKET_CONFIG.all.label}
              count={counts?.byBucket.all ?? 0}
              icon={BUCKET_CONFIG.all.icon}
              color={BUCKET_CONFIG.all.color}
              bgColor={BUCKET_CONFIG.all.bgColor}
              onClick={() => router.push('/responses')}
            />
            <StatCard
              label={BUCKET_CONFIG['needs-action'].label}
              count={counts?.byBucket['needs-action'] ?? 0}
              icon={BUCKET_CONFIG['needs-action'].icon}
              color={BUCKET_CONFIG['needs-action'].color}
              bgColor={BUCKET_CONFIG['needs-action'].bgColor}
              onClick={() => router.push('/responses?bucket=needs-action')}
            />
            <StatCard
              label={BUCKET_CONFIG.denied.label}
              count={counts?.byBucket.denied ?? 0}
              icon={BUCKET_CONFIG.denied.icon}
              color={BUCKET_CONFIG.denied.color}
              bgColor={BUCKET_CONFIG.denied.bgColor}
              onClick={() => router.push('/responses?bucket=denied')}
            />
            <StatCard
              label="Pending Legal Review"
              count={pendingReview}
              icon={FileWarning}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              onClick={() => router.push('/legal-workbook')}
            />
            <ProgressStatCard
              label="Clauses Verified"
              current={verifiedClauses}
              total={totalClauses}
              icon={ShieldCheck}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              barColor="bg-emerald-500"
              onClick={() => router.push('/legal-workbook')}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <button
              onClick={() => router.push('/responses?bucket=done')}
              className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG.done.dotColor)} />
              {BUCKET_CONFIG.done.label}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket.done ?? 0}</span>
            </button>
            <button
              onClick={() => router.push('/responses?bucket=no-action')}
              className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG['no-action'].dotColor)} />
              {BUCKET_CONFIG['no-action'].label}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket['no-action'] ?? 0}</span>
            </button>
            <button
              onClick={() => router.push('/responses?bucket=review')}
              className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG.review.dotColor)} />
              {BUCKET_CONFIG.review.label}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket.review ?? 0}</span>
            </button>
            <button
              onClick={() => router.push('/legal-workbook')}
              className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <Globe2 className="h-3 w-3 text-zinc-400" />
              Jurisdictions
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{regimes.length}</span>
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {activity.length === 0 && <p className="text-sm text-zinc-400">No activity yet.</p>}
              {activity.map((a) => {
                const iconConfig = ACTION_ICON_CONFIG[a.type]
                const Icon = iconConfig.icon
                return (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/responses?open=${a.responseId}`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', iconConfig.bgColor)}>
                      <Icon className={cn('h-3.5 w-3.5', iconConfig.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {ACTION_LABELS[a.type] ?? a.type} · {a.response.brokerName}
                      </p>
                      {a.emailSubject && <p className="mt-0.5 truncate text-xs text-zinc-500">{a.emailSubject}</p>}
                      {a.note && <p className="mt-0.5 truncate text-xs text-zinc-500">{a.note}</p>}
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600">
                      {formatRelativeTime(a.createdAt)}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Tag Breakdown
            </h2>
            {counts && (
              <TagBreakdown
                counts={counts.byTag}
                onSelectTag={(tag) => router.push(`/responses?tag=${tag}`)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
