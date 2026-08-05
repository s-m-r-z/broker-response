'use client'

import { Inbox } from 'lucide-react'
import { ENFORCEMENT_STAGES, type EnforcementStage, CASE_STATUSES, type CaseStatus } from '@/lib/case-tracker'
import { STAGE_CONFIG, CASE_STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '../info-tooltip'

interface CaseSidebarProps {
  activeStage: EnforcementStage | 'all'
  onStageSelect: (stage: EnforcementStage | 'all') => void
  counts: Record<EnforcementStage, number>
  totalCount: number
  activeStatus: CaseStatus | 'all'
  onStatusSelect: (status: CaseStatus | 'all') => void
  statusCounts: Record<CaseStatus, number>
}

export function CaseSidebar({ activeStage, onStageSelect, counts, totalCount, activeStatus, onStatusSelect, statusCounts }: CaseSidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Case Tracker</p>
        <p className="text-[10px] text-zinc-500">Enforcement pipeline</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Stage
        </p>
        <button
          onClick={() => onStageSelect('all')}
          data-testid="case-sidebar-all"
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
            activeStage === 'all'
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
          )}
        >
          <Inbox className={cn('h-4 w-4', activeStage === 'all' ? 'text-zinc-900 dark:text-zinc-100' : '')} />
          <span className="flex-1 text-left">All Cases</span>
          {totalCount > 0 && (
            <span className="text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600">
              {totalCount.toLocaleString()}
            </span>
          )}
        </button>

        {ENFORCEMENT_STAGES.map((stage) => {
          const config = STAGE_CONFIG[stage]
          const Icon = config.icon
          const isActive = activeStage === stage
          return (
            <InfoTooltip key={stage} content={config.description}>
              <button
                onClick={() => onStageSelect(stage)}
                data-testid={`case-sidebar-stage-${stage}`}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? config.color : '')} />
                <span className="flex-1 text-left">{config.label}</span>
                {(counts[stage] ?? 0) > 0 && (
                  <span className="text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600">
                    {counts[stage].toLocaleString()}
                  </span>
                )}
              </button>
            </InfoTooltip>
          )
        })}

        {/* Four-state status filter (US-23) — independent of the stage
            filter above, so it combines with it rather than replacing it. */}
        <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Status
        </p>
        <button
          onClick={() => onStatusSelect('all')}
          data-testid="case-sidebar-status-all"
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
            activeStatus === 'all'
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
          )}
        >
          <Inbox className={cn('h-4 w-4', activeStatus === 'all' ? 'text-zinc-900 dark:text-zinc-100' : '')} />
          <span className="flex-1 text-left">Any Status</span>
        </button>
        {CASE_STATUSES.map((status) => {
          const config = CASE_STATUS_CONFIG[status]
          const Icon = config.icon
          const isActive = activeStatus === status
          return (
            <InfoTooltip key={status} content={config.description}>
              <button
                onClick={() => onStatusSelect(status)}
                data-testid={`case-sidebar-status-${status}`}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? config.color : '')} />
                <span className="flex-1 text-left">{config.label}</span>
                {(statusCounts[status] ?? 0) > 0 && (
                  <span className="text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-600">
                    {statusCounts[status].toLocaleString()}
                  </span>
                )}
              </button>
            </InfoTooltip>
          )
        })}
      </nav>
    </aside>
  )
}
