'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { type LawRegime, type Case, type BrokerResponse } from '@/lib/types'
import { matchesJurisdiction } from '@/lib/jurisdiction-map'
import { NavRail } from '../nav-rail'
import { RegimeSidebar } from './regime-sidebar'
import { RegimeDetail } from './regime-detail'
import { AddRegimeDialog } from './add-regime-dialog'

export function LegalWorkbook() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [regimes, setRegimes] = useState<LawRegime[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [responses, setResponses] = useState<BrokerResponse[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const fetchRegimes = useCallback(async () => {
    const res = await fetch('/api/legal/regimes')
    if (!res.ok) return
    const data: LawRegime[] = await res.json()
    setRegimes(data)
    setSelectedId((current) => current ?? data[0]?.id ?? null)
  }, [])

  useEffect(() => {
    fetchRegimes()
  }, [fetchRegimes])

  // Cross-area counts for the "N cases / N responses in this jurisdiction"
  // jump links on RegimeDetail — same reasoning as home-overview.tsx pulling
  // counts from all three areas, just scoped to the selected regime here.
  useEffect(() => {
    fetch('/api/cases').then((r) => (r.ok ? r.json() : [])).then(setCases)
    fetch('/api/responses?pageSize=1000').then((r) => (r.ok ? r.json() : { data: [] })).then((d) => setResponses(d.data ?? []))
  }, [])

  // One-time deep-link support, e.g. from a case/response's Relevant Law
  // panel: ?open= fetches and selects a specific regime directly, mirroring
  // the /responses?open= and /case-tracker?open= convention.
  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) {
      fetch(`/api/legal/regimes/${openId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: LawRegime | null) => {
          if (!data) return
          setRegimes((prev) => (prev.some((r) => r.id === data.id) ? prev : [data, ...prev]))
          setSelectedId(data.id)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = regimes.find((r) => r.id === selectedId) ?? null

  const caseCount = selected
    ? cases.filter((c) => matchesJurisdiction(selected, c.userState ? `${c.userState}, ${c.userCountry}` : c.userCountry)).length
    : 0
  const responseCount = selected
    ? responses.filter((r) => r.jurisdiction && matchesJurisdiction(selected, r.jurisdiction)).length
    : 0

  async function handleRecheck(id: string) {
    await fetch(`/api/legal/regimes/${id}/recheck`, { method: 'POST' })
    await fetchRegimes()
  }

  async function handleToggleVerified(clauseId: string, verified: boolean) {
    await fetch(`/api/legal/clauses/${clauseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    })
    await fetchRegimes()
  }

  async function handleReviewChange(changeId: string, action: 'accept' | 'reject') {
    await fetch(`/api/legal/changes/${changeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await fetchRegimes()
  }

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 overflow-hidden dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex flex-1 overflow-hidden">
        <NavRail active="legal" />
        <RegimeSidebar
          regimes={regimes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddNew={() => setAddOpen(true)}
        />
        <RegimeDetail
          regime={selected}
          caseCount={caseCount}
          responseCount={responseCount}
          onRecheck={handleRecheck}
          onToggleVerified={handleToggleVerified}
          onReviewChange={handleReviewChange}
          onViewCases={() => router.push('/case-tracker')}
          onViewResponses={() => router.push('/responses')}
        />
      </div>

      <AddRegimeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={fetchRegimes} />
    </div>
  )
}
