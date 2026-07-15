'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { type Case } from '@/lib/types'
import { ENFORCEMENT_STAGES, type EnforcementStage } from '@/lib/case-tracker'
import { NavRail } from '../nav-rail'
import { CaseSidebar } from './case-sidebar'
import { CaseList } from './case-list'
import { CaseDetail } from './case-detail'
import { NewCaseDialog } from './new-case-dialog'

export function CaseTracker() {
  const searchParams = useSearchParams()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState<EnforcementStage | 'all'>('all')
  const [search, setSearch] = useState('')
  const [newCaseOpen, setNewCaseOpen] = useState(false)

  const fetchCases = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/cases')
    if (res.ok) setCases(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  // One-time deep-link support, e.g. from the dashboard's "Track as Case"
  // action: ?open= fetches and selects a specific case directly, independent
  // of whether the list fetch above has resolved yet.
  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) {
      fetch(`/api/cases/${openId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: Case | null) => {
          if (!data) return
          setCases((prev) => (prev.some((c) => c.id === data.id) ? prev : [data, ...prev]))
          setSelectedId(data.id)
        })
    }
  }, [])

  const selected = cases.find((c) => c.id === selectedId) ?? null
  const filteredCases = cases
    .filter((c) => activeStage === 'all' || c.enforcementStage === activeStage)
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.brokerName.toLowerCase().includes(q) ||
        c.userCountry.toLowerCase().includes(q) ||
        (c.userState ?? '').toLowerCase().includes(q)
      )
    })

  // Counts always reflect the full case list, independent of activeStage, so
  // switching filters doesn't make other stages' counts disappear — mirrors
  // how the dashboard's Sidebar counts come from an unfiltered source.
  const stageCounts = ENFORCEMENT_STAGES.reduce((acc, stage) => {
    acc[stage] = cases.filter((c) => c.enforcementStage === stage).length
    return acc
  }, {} as Record<EnforcementStage, number>)

  async function handleConfirmJurisdiction(id: string) {
    const res = await fetch(`/api/cases/${id}/confirm-jurisdiction`, { method: 'PATCH' })
    if (res.ok) await fetchCases()
  }

  async function handleConfirmAuthority(id: string) {
    const res = await fetch(`/api/cases/${id}/confirm-authority`, { method: 'PATCH' })
    if (res.ok) await fetchCases()
  }

  async function handleAdvanceStage(id: string, note?: string) {
    const res = await fetch(`/api/cases/${id}/advance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (res.ok) {
      await fetchCases()
      return {}
    }
    const body = await res.json().catch(() => null)
    return { error: body?.error ?? 'Failed to advance case' }
  }

  function handleCreated(created: Case) {
    setNewCaseOpen(false)
    setSelectedId(created.id)
    fetchCases()
  }

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 overflow-hidden dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex flex-1 overflow-hidden">
        <NavRail active="cases" />
        <CaseSidebar
          activeStage={activeStage}
          onStageSelect={setActiveStage}
          counts={stageCounts}
          totalCount={cases.length}
        />
        <CaseList
          cases={filteredCases}
          loading={loading}
          selectedId={selectedId}
          activeStage={activeStage}
          search={search}
          onSelect={setSelectedId}
          onNewCase={() => setNewCaseOpen(true)}
          onRefresh={fetchCases}
          onSearch={setSearch}
        />
        <CaseDetail
          kase={selected}
          onConfirmJurisdiction={handleConfirmJurisdiction}
          onConfirmAuthority={handleConfirmAuthority}
          onAdvanceStage={handleAdvanceStage}
        />
      </div>

      <NewCaseDialog open={newCaseOpen} onClose={() => setNewCaseOpen(false)} onCreated={handleCreated} />
    </div>
  )
}
