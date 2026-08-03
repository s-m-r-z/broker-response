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

/** The next stage in the pipeline, or null if already at the terminal stage. */
export function getNextStage(stage: EnforcementStage): EnforcementStage | null {
  const i = ENFORCEMENT_STAGES.indexOf(stage)
  return i === ENFORCEMENT_STAGES.length - 1 ? null : ENFORCEMENT_STAGES[i + 1]
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
  currentStage: EnforcementStage
  targetStage: EnforcementStage
  jurisdictionConfirmedAt: Date | null
  authorityConfirmedAt: Date | null
}

export type StageTransitionResult = { ok: true } | { ok: false; error: string }

/** Stages can only advance one at a time, in pipeline order — no skipping ahead, no going back. */
export function canTransitionStage(input: StageTransitionCheckInput): StageTransitionResult {
  const currentIndex = ENFORCEMENT_STAGES.indexOf(input.currentStage)
  const targetIndex = ENFORCEMENT_STAGES.indexOf(input.targetStage)
  if (targetIndex !== currentIndex + 1) {
    return {
      ok: false,
      error: `Cannot advance from ${input.currentStage} to ${input.targetStage} — stages must be advanced one at a time, in order.`,
    }
  }
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

// The evidence-completeness checklist gating case closure (US-19/US-21).
// Each item maps to a `evidence{Item}ConfirmedAt` field on Case — see
// prisma/schema.prisma. Order here is display order in the checklist UI.
export const EVIDENCE_ITEMS = ['request', 'identity', 'systems', 'reply', 'retentionException'] as const
export type EvidenceItem = (typeof EVIDENCE_ITEMS)[number]

export const EVIDENCE_ITEM_FIELD: Record<EvidenceItem, string> = {
  request: 'evidenceRequestConfirmedAt',
  identity: 'evidenceIdentityConfirmedAt',
  systems: 'evidenceSystemsConfirmedAt',
  reply: 'evidenceReplyConfirmedAt',
  retentionException: 'evidenceRetentionConfirmedAt',
}

// Date on the server (raw Prisma model), string once serialized to JSON and
// read back on the client (see lib/types.ts's Case interface) — both shapes
// need to satisfy this so the same helpers work in API routes and in UI.
export interface EvidenceCaseFields {
  evidenceRequestConfirmedAt: Date | string | null
  evidenceIdentityConfirmedAt: Date | string | null
  evidenceSystemsConfirmedAt: Date | string | null
  evidenceReplyConfirmedAt: Date | string | null
  evidenceRetentionConfirmedAt: Date | string | null
}

/** Which evidence items are still unconfirmed, in checklist order. */
export function getMissingEvidenceItems(kase: EvidenceCaseFields): EvidenceItem[] {
  return EVIDENCE_ITEMS.filter((item) => !kase[EVIDENCE_ITEM_FIELD[item] as keyof EvidenceCaseFields])
}

export type CloseCaseResult = { ok: true } | { ok: false; error: string; missing: EvidenceItem[] }

/** Closure is blocked unless every evidence item is confirmed and the case isn't already closed. */
export function assertCanClose(kase: EvidenceCaseFields & { closedAt: Date | null }): CloseCaseResult {
  if (kase.closedAt) {
    return { ok: false, error: `Case was already closed at ${kase.closedAt.toISOString()} and cannot be closed again.`, missing: [] }
  }
  const missing = getMissingEvidenceItems(kase)
  if (missing.length > 0) {
    return { ok: false, error: `Cannot close — missing evidence: ${missing.join(', ')}.`, missing }
  }
  return { ok: true }
}
