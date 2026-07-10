// Business rules for broker non-response cases: deriving the applicable
// regime from the user's location (never the broker's), and gating
// enforcement-stage transitions on the confirmation timestamps. The API
// route layer (app/api/cases/**) should only call these functions, not
// re-implement any of this logic.

import { resolveJurisdiction, type JurisdictionResolution } from '@/lib/jurisdiction-map'

export const ENFORCEMENT_STAGES = [
  'request_sent',
  'deadline_approaching',
  'deadline_passed',
  'followup_sent',
  'complaint_eligible',
  'complaint_filed',
] as const

export type EnforcementStage = (typeof ENFORCEMENT_STAGES)[number]

export function isEnforcementStage(value: string): value is EnforcementStage {
  return (ENFORCEMENT_STAGES as readonly string[]).includes(value)
}

export interface DeriveCaseFieldsInput {
  userCountry: string
  userState?: string | null
  removalRequestDate: Date
}

export interface DerivedCaseFields extends JurisdictionResolution {
  responseDeadlineDate: Date
}

export interface DeriveCaseFieldsUnmapped {
  mapped: false
  warning: string
}

export type DeriveCaseFieldsResult = ({ mapped: true } & DerivedCaseFields) | DeriveCaseFieldsUnmapped

/**
 * Derives regime/deadline/authority/complaintUrl/maxFine purely from the
 * user's location. brokerCountry is intentionally not a parameter here —
 * there is no way to call this function "from" the broker's jurisdiction.
 */
export function deriveCaseFields(input: DeriveCaseFieldsInput): DeriveCaseFieldsResult {
  const resolution = resolveJurisdiction(input.userCountry, input.userState)

  if (!resolution.mapped) {
    return { mapped: false, warning: resolution.warning }
  }

  const responseDeadlineDate = new Date(input.removalRequestDate)
  responseDeadlineDate.setUTCDate(responseDeadlineDate.getUTCDate() + resolution.responseWindowDays)

  const { mapped: _mapped, ...resolvedFields } = resolution
  return { mapped: true, ...resolvedFields, responseDeadlineDate }
}

export interface StageTransitionCheckInput {
  targetStage: EnforcementStage
  jurisdictionConfirmedAt: Date | null
  authorityConfirmedAt: Date | null
}

export type StageTransitionResult = { ok: true } | { ok: false; error: string }

export function canTransitionStage(input: StageTransitionCheckInput): StageTransitionResult {
  if (input.targetStage === 'complaint_eligible' && !input.jurisdictionConfirmedAt) {
    return { ok: false, error: 'Case cannot reach complaint_eligible without jurisdiction confirmed.' }
  }
  if (input.targetStage === 'complaint_filed' && !input.authorityConfirmedAt) {
    return { ok: false, error: 'Case cannot reach complaint_filed without authority confirmed.' }
  }
  return { ok: true }
}

export type ConfirmationResult = { ok: true } | { ok: false; error: string }

/** Confirmation timestamps are immutable once set — confirming twice is an error, not a no-op. */
export function assertConfirmable(alreadyConfirmedAt: Date | null, label: string): ConfirmationResult {
  if (alreadyConfirmedAt) {
    return { ok: false, error: `${label} was already confirmed at ${alreadyConfirmedAt.toISOString()} and cannot be changed.` }
  }
  return { ok: true }
}
