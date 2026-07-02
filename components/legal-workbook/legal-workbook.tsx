'use client'

import { useState, useEffect, useCallback } from 'react'
import { type LawRegime } from '@/lib/types'
import { NavRail } from '../nav-rail'
import { RegimeSidebar } from './regime-sidebar'
import { RegimeDetail } from './regime-detail'
import { AddRegimeDialog } from './add-regime-dialog'

export function LegalWorkbook() {
  const [regimes, setRegimes] = useState<LawRegime[]>([])
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

  const selected = regimes.find((r) => r.id === selectedId) ?? null

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
          onRecheck={handleRecheck}
          onToggleVerified={handleToggleVerified}
          onReviewChange={handleReviewChange}
        />
      </div>

      <AddRegimeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={fetchRegimes} />
    </div>
  )
}
