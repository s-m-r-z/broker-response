'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { type LawRegime } from '@/lib/types'
import { matchesJurisdiction } from '@/lib/jurisdiction-map'
import { ClauseCategoryBadge } from './clause-category-badge'
import { Button } from '../ui/button'

interface RelevantLawPanelProps {
  jurisdiction: string | null
  onInsertCitation: (text: string) => void
}

export function RelevantLawPanel({ jurisdiction, onInsertCitation }: RelevantLawPanelProps) {
  const router = useRouter()
  const [regimes, setRegimes] = useState<LawRegime[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/legal/regimes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setRegimes(data))
  }, [])

  if (!jurisdiction) return null

  const matches = regimes.filter((r) => matchesJurisdiction(r, jurisdiction))
  if (matches.length === 0) return null

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
        <Scale className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
        Relevant Law
      </p>
      <div className="space-y-2">
        {matches.map((regime) => {
          const isOpen = expandedId === regime.id
          return (
            <div key={regime.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 pr-2">
                <button
                  onClick={() => setExpandedId(isOpen ? null : regime.id)}
                  data-testid={`relevant-law-toggle-${regime.id}`}
                  aria-expanded={isOpen}
                  className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  {regime.name}
                  <span className="font-normal text-xs text-zinc-400">
                    {regime.state ? `${regime.state}, ${regime.country}` : regime.country}
                  </span>
                </button>
                <button
                  onClick={() => router.push(`/legal-workbook?open=${regime.id}`)}
                  aria-label="Open in Legal Workbook"
                  title="Open in Legal Workbook"
                  data-testid={`relevant-law-open-${regime.id}`}
                  className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
              {isOpen && (
                <div className="space-y-2 border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  {regime.clauses.map((clause) => (
                    <div key={clause.id} className="rounded-md bg-zinc-50 p-2.5 dark:bg-zinc-900">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="mb-1">
                            <ClauseCategoryBadge category={clause.category} />
                          </div>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{clause.title}</p>
                          <p className="text-[11px] text-zinc-500">{clause.citation}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onInsertCitation(`Per ${clause.citation}: ${clause.text}`)}
                          data-testid={`relevant-law-insert-${clause.id}`}
                        >
                          Insert
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
