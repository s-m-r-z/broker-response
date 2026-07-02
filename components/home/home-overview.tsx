'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Scale, Globe2, ShieldAlert, FileWarning } from 'lucide-react'
import { type Bucket, type Tag, type LawRegime, type RecentActivityItem } from '@/lib/types'
import { BUCKET_CONFIG, ACTION_LABELS } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { NavRail } from '../nav-rail'
import { StatCard } from './stat-card'
import { NavTile } from './nav-tile'

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

  const unverifiedClauses = regimes.reduce(
    (n, r) => n + r.clauses.filter((c) => !c.verified).length,
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
            Broker Response
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(Object.keys(BUCKET_CONFIG) as Bucket[]).map((bucketId) => {
              const config = BUCKET_CONFIG[bucketId]
              return (
                <StatCard
                  key={bucketId}
                  label={config.label}
                  count={counts?.byBucket[bucketId] ?? 0}
                  icon={config.icon}
                  color={config.color}
                  bgColor={config.bgColor}
                  borderColor={config.borderColor}
                  onClick={() => router.push(`/responses?bucket=${bucketId}`)}
                />
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Legal Workbook
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Jurisdictions"
              count={regimes.length}
              icon={Globe2}
              color="text-violet-400"
              bgColor="bg-violet-500/10"
              borderColor="border-violet-500/20"
              onClick={() => router.push('/legal-workbook')}
            />
            <StatCard
              label="Unverified Clauses"
              count={unverifiedClauses}
              icon={ShieldAlert}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              borderColor="border-amber-500/20"
              onClick={() => router.push('/legal-workbook')}
            />
            <StatCard
              label="Pending Review"
              count={pendingReview}
              icon={FileWarning}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              borderColor="border-amber-500/20"
              onClick={() => router.push('/legal-workbook')}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Go To
            </h2>
            <div className="space-y-3">
              <NavTile
                icon={Shield}
                iconBg="bg-blue-600"
                title="Broker Response Dashboard"
                description="Triage broker replies, take action, and email brokers"
                onClick={() => router.push('/responses')}
              />
              <NavTile
                icon={Scale}
                iconBg="bg-violet-600"
                title="Legal Workbook"
                description="Browse data-protection law and clauses by jurisdiction"
                onClick={() => router.push('/legal-workbook')}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {activity.length === 0 && <p className="text-sm text-zinc-400">No activity yet.</p>}
              {activity.map((a) => (
                <button
                  key={a.id}
                  onClick={() => router.push(`/responses?open=${a.responseId}`)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="min-w-0">
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
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
