'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Case } from '@/lib/types'
import { NavRail } from '../nav-rail'
import { CaseList } from './case-list'
import { CaseDetail } from './case-detail'
import { NewCaseDialog } from './new-case-dialog'

export function CaseTracker() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  const selected = cases.find((c) => c.id === selectedId) ?? null

  async function handleConfirmJurisdiction(id: string) {
    const res = await fetch(`/api/cases/${id}/confirm-jurisdiction`, { method: 'PATCH' })
    if (res.ok) await fetchCases()
  }

  async function handleConfirmAuthority(id: string) {
    const res = await fetch(`/api/cases/${id}/confirm-authority`, { method: 'PATCH' })
    if (res.ok) await fetchCases()
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
        <CaseList
          cases={cases}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNewCase={() => setNewCaseOpen(true)}
          onRefresh={fetchCases}
        />
        <CaseDetail
          kase={selected}
          onConfirmJurisdiction={handleConfirmJurisdiction}
          onConfirmAuthority={handleConfirmAuthority}
        />
      </div>

      <NewCaseDialog open={newCaseOpen} onClose={() => setNewCaseOpen(false)} onCreated={handleCreated} />
    </div>
  )
}
