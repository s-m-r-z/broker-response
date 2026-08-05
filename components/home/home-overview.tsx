'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, FileWarning, Globe2, Gavel, TriangleAlert, Clock } from 'lucide-react'
import { type Bucket, type Tag, type LawRegime, type RecentActivityItem, type Case } from '@/lib/types'
import { BUCKET_CONFIG, ACTION_LABELS, ACTION_ICON_CONFIG, STAGE_CONFIG, CASE_EVENT_CONFIG, STAKEHOLDER_CONFIG } from '@/lib/constants'
import { type EnforcementStage } from '@/lib/case-tracker'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { NavRail } from '../nav-rail'
import { StatCard } from './stat-card'
import { ProgressStatCard } from './progress-stat-card'
import { TagBreakdown } from './tag-breakdown'
import { StageBreakdown } from './stage-breakdown'
import { InfoTooltip } from '../info-tooltip'

interface Counts {
  byTag: Record<Tag, number>
  byBucket: Record<Bucket, number>
}

export function HomeOverview() {
  const router = useRouter()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [regimes, setRegimes] = useState<LawRegime[]>([])
  const [activity, setActivity] = useState<RecentActivityItem[]>([])
  const [cases, setCases] = useState<Case[]>([])

  useEffect(() => {
    fetch('/api/counts').then((r) => r.json()).then(setCounts)
    fetch('/api/legal/regimes').then((r) => r.json()).then(setRegimes)
    fetch('/api/activity').then((r) => r.json()).then(setActivity)
    fetch('/api/cases').then((r) => r.json()).then(setCases)
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

  const activeCases = cases.filter((c) => c.enforcementStage !== 'complaint_filed').length
  const overdueCases = cases.filter(
    (c) => c.enforcementStage !== 'complaint_filed' && new Date(c.responseDeadlineDate) < new Date()
  ).length
  const confirmedCases = cases.filter((c) => c.jurisdictionConfirmedAt && c.authorityConfirmedAt).length

  const stageCounts = cases.reduce((acc, c) => {
    acc[c.enforcementStage] = (acc[c.enforcementStage] ?? 0) + 1
    return acc
  }, {} as Record<EnforcementStage, number>)

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <NavRail active="home" />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <header className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Overview</h1>
          <p className="text-sm text-zinc-500">PureWL Compliance · broker response triage, case tracking &amp; legal reference</p>
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
              description={BUCKET_CONFIG.all.description}
              testId="stat-card-all"
              onClick={() => router.push('/responses')}
            />
            <StatCard
              label={BUCKET_CONFIG['needs-action'].label}
              count={counts?.byBucket['needs-action'] ?? 0}
              icon={BUCKET_CONFIG['needs-action'].icon}
              color={BUCKET_CONFIG['needs-action'].color}
              bgColor={BUCKET_CONFIG['needs-action'].bgColor}
              description={BUCKET_CONFIG['needs-action'].description}
              testId="stat-card-needs-action"
              onClick={() => router.push('/responses?bucket=needs-action')}
            />
            <StatCard
              label={BUCKET_CONFIG.denied.label}
              count={counts?.byBucket.denied ?? 0}
              icon={BUCKET_CONFIG.denied.icon}
              color={BUCKET_CONFIG.denied.color}
              bgColor={BUCKET_CONFIG.denied.bgColor}
              description={BUCKET_CONFIG.denied.description}
              testId="stat-card-denied"
              onClick={() => router.push('/responses?bucket=denied')}
            />
            <ProgressStatCard
              label="Jurisdiction & Authority Confirmed"
              current={confirmedCases}
              total={cases.length}
              icon={Gavel}
              color="text-violet-400"
              bgColor="bg-violet-500/10"
              barColor="bg-violet-500/45"
              description="Cases where both the applicable jurisdiction and the filing authority have been confirmed, out of all tracked cases."
              testId="stat-card-cases-confirmed"
              onClick={() => router.push('/case-tracker')}
            />
            <ProgressStatCard
              label="Cases Overdue"
              current={overdueCases}
              total={activeCases}
              icon={TriangleAlert}
              color="text-red-400"
              bgColor="bg-red-500/10"
              barColor="bg-red-500/45"
              description="Active cases (not yet complaint-filed) whose response deadline has already passed, out of all active cases."
              testId="stat-card-cases-overdue"
              onClick={() => router.push('/case-tracker')}
            />
            <ProgressStatCard
              label="Pending Legal Review"
              current={pendingReview}
              total={totalClauses}
              icon={FileWarning}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              barColor="bg-amber-500/45"
              description="Law clauses with an AI-proposed change awaiting accept/reject, out of all clauses across every jurisdiction."
              testId="stat-card-pending-legal-review"
              onClick={() => router.push('/legal-workbook')}
            />
            <ProgressStatCard
              label="Clauses Verified"
              current={verifiedClauses}
              total={totalClauses}
              icon={ShieldCheck}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              barColor="bg-emerald-500/45"
              description="Law clauses a human has reviewed and confirmed, out of all clauses across every jurisdiction."
              testId="stat-card-clauses-verified"
              onClick={() => router.push('/legal-workbook')}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <InfoTooltip content={BUCKET_CONFIG.done.description}>
              <button
                onClick={() => router.push('/responses?bucket=done')}
                data-testid="legend-done"
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG.done.dotColor)} />
                {BUCKET_CONFIG.done.label}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket.done ?? 0}</span>
              </button>
            </InfoTooltip>
            <InfoTooltip content={BUCKET_CONFIG['no-action'].description}>
              <button
                onClick={() => router.push('/responses?bucket=no-action')}
                data-testid="legend-no-action"
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG['no-action'].dotColor)} />
                {BUCKET_CONFIG['no-action'].label}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket['no-action'] ?? 0}</span>
              </button>
            </InfoTooltip>
            <InfoTooltip content={BUCKET_CONFIG.review.description}>
              <button
                onClick={() => router.push('/responses?bucket=review')}
                data-testid="legend-review"
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', BUCKET_CONFIG.review.dotColor)} />
                {BUCKET_CONFIG.review.label}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{counts?.byBucket.review ?? 0}</span>
              </button>
            </InfoTooltip>
            <InfoTooltip content="Jurisdictions with a legal workbook entry — data-protection regimes we have clause reference data for.">
              <button
                onClick={() => router.push('/legal-workbook')}
                data-testid="legend-jurisdictions"
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <Globe2 className="h-3 w-3 text-zinc-400" />
                Jurisdictions
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{regimes.length}</span>
              </button>
            </InfoTooltip>
            <InfoTooltip content="Broker non-response cases currently being tracked through the enforcement pipeline.">
              <button
                onClick={() => router.push('/case-tracker')}
                data-testid="legend-cases"
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <Gavel className="h-3 w-3 text-zinc-400" />
                Cases
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{cases.length}</span>
              </button>
            </InfoTooltip>
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
                if (a.source === 'case') {
                  const config =
                    a.type === 'STAGE_ADVANCED' && a.stage ? STAGE_CONFIG[a.stage] : CASE_EVENT_CONFIG[a.type as 'JURISDICTION_CONFIRMED' | 'AUTHORITY_CONFIRMED']
                  const Icon = config?.icon ?? Clock
                  return (
                    <button
                      key={a.id}
                      onClick={() => router.push(`/case-tracker?open=${a.caseId}`)}
                      data-testid={`activity-row-${a.id}`}
                      className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-500/10">
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {config?.label ?? a.type} · {a.case.brokerName}
                        </p>
                        {a.note && <p className="mt-0.5 truncate text-xs text-zinc-500">{a.note}</p>}
                      </div>
                      <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-600">
                        {formatRelativeTime(a.createdAt)}
                      </span>
                    </button>
                  )
                }

                const iconConfig = ACTION_ICON_CONFIG[a.type]
                const Icon = iconConfig.icon
                const label =
                  a.type === 'ASSIGNED' && a.assignedTo
                    ? `Assigned to ${STAKEHOLDER_CONFIG[a.assignedTo].label}`
                    : ACTION_LABELS[a.type] ?? a.type
                return (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/responses?open=${a.responseId}`)}
                    data-testid={`activity-row-${a.id}`}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', iconConfig.bgColor)}>
                      <Icon className={cn('h-3.5 w-3.5', iconConfig.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {label} · {a.response.brokerName}
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

          <div className="space-y-6">
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

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                Case Stage Breakdown
              </h2>
              <StageBreakdown counts={stageCounts} onSelectStage={() => router.push('/case-tracker')} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
