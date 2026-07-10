'use client'

import { useTheme } from '../theme-provider'
import { cn } from '@/lib/utils'

export interface DonutSegment {
  key: string
  label: string
  value: number
  light: string
  dark: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  centerLabel: string
  onSelect?: (key: string) => void
  className?: string
}

const SIZE = 128
const STROKE = 18
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_PX = 3

// Segment order and color are fixed per caller (validated categorical palette —
// see the dataviz skill run for this feature) so identity never shifts when
// values change. A legend always ships alongside so color is never the only
// channel carrying identity.
export function DonutChart({ segments, centerLabel, onSelect, className }: DonutChartProps) {
  const { theme } = useTheme()
  const total = segments.reduce((n, s) => n + s.value, 0)
  const visible = segments.filter((s) => s.value > 0)

  if (total === 0) {
    return <p className="text-sm text-zinc-400">No data yet.</p>
  }

  let cumulative = 0

  return (
    <div className={cn('flex items-center gap-5', className)}>
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800"
            strokeWidth={STROKE}
          />
          {visible.map((s) => {
            const length = (s.value / total) * CIRCUMFERENCE
            const dash = Math.max(length - GAP_PX, 0)
            const offset = -cumulative
            cumulative += length
            return (
              <circle
                key={s.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={theme === 'dark' ? s.dark : s.light}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={offset}
                onClick={onSelect ? () => onSelect(s.key) : undefined}
                className={onSelect ? 'cursor-pointer' : undefined}
              >
                <title>
                  {s.label}: {s.value} ({Math.round((s.value / total) * 100)}%)
                </title>
              </circle>
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <DonutCenterLabel total={total} label={centerLabel} />
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {visible.map((s) => (
          <button
            key={s.key}
            onClick={() => onSelect?.(s.key)}
            className="flex w-full items-center gap-2 text-left disabled:cursor-default"
            disabled={!onSelect}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: theme === 'dark' ? s.dark : s.light }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-400">{s.label}</span>
            <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {s.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function DonutCenterLabel({ total, label }: { total: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{total}</p>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600">{label}</p>
    </div>
  )
}
