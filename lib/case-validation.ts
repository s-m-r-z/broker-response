// Zod schemas for case-tracker API payloads.
//
// createCaseSchema is deliberately `.strict()` and only accepts the raw
// intake fields (user location, broker name/country, removal request date).
// applicableRegime/filingAuthority/complaintUrl/maxFine/responseDeadlineDate
// are never client-settable — they only ever come from
// lib/case-tracker.ts's deriveCaseFields(), which reads user location and
// has no brokerCountry parameter to derive from in the first place.

import { z } from 'zod'
import { EVIDENCE_ITEMS } from './case-tracker'

export const createCaseSchema = z
  .object({
    userCountry: z.string().min(1),
    userState: z.string().min(1).optional(),
    brokerName: z.string().min(1),
    brokerCountry: z.string().min(1),
    removalRequestDate: z.string().datetime({ message: 'removalRequestDate must be ISO 8601 UTC' }),
    sourceResponseId: z.string().min(1).optional(),
    // Reference context (US-02) — optional; case-detail.tsx flags a missing
    // contractFileRef with a prompt rather than blocking creation on it.
    contractFileRef: z.string().min(1).optional(),
    dataFlowNote: z.string().min(1).optional(),
  })
  .strict()

export type CreateCaseInput = z.infer<typeof createCaseSchema>

export const advanceCaseSchema = z
  .object({
    note: z.string().min(1).optional(),
  })
  .strict()

export type AdvanceCaseInput = z.infer<typeof advanceCaseSchema>

// Confirms one evidence-checklist item (US-19/US-21). note is required for
// retentionException specifically — "no exception applies" is itself the
// confirmed value, not an absence, so it can't be left blank the way an
// optional note on the other four items can.
export const confirmEvidenceSchema = z
  .object({
    item: z.enum(EVIDENCE_ITEMS),
    note: z.string().min(1).optional(),
  })
  .strict()
  .refine((data) => data.item !== 'retentionException' || !!data.note, {
    message: 'note is required when confirming retentionException',
    path: ['note'],
  })

export type ConfirmEvidenceInput = z.infer<typeof confirmEvidenceSchema>

// Saves the case's draft reply text and the provenance log of what was
// inserted from where (US-13/US-20). Freely editable — not gated by
// assertConfirmable like the evidence items, since a draft is expected to
// be revised repeatedly before approval.
export const saveDraftSchema = z
  .object({
    draftReply: z.string(),
    draftInsertions: z
      .array(
        z.object({
          id: z.string().min(1),
          source: z.enum(['PRIOR_CASE', 'TEMPLATE']),
          label: z.string().min(1),
          sourceCaseId: z.string().min(1).optional(),
          text: z.string(),
        })
      )
      .optional(),
  })
  .strict()

export type SaveDraftInput = z.infer<typeof saveDraftSchema>

// Approves the *current* draft text for filing (US-25). Not immutable like
// jurisdiction/authority confirmation — re-approving after an edit is the
// expected flow, so this can be called any number of times.
export const approveDraftSchema = z
  .object({
    reviewerName: z.string().min(1),
  })
  .strict()

export type ApproveDraftInput = z.infer<typeof approveDraftSchema>

// The structured internal confirmation form (US-18) — all four fields plus
// the responder's name are required; an incomplete submission is rejected
// outright rather than partially saved.
export const structuredConfirmationSchema = z
  .object({
    systemName: z.string().min(1),
    actionTaken: z.string().min(1),
    date: z.string().min(1),
    retentionException: z.string().min(1),
    responderName: z.string().min(1),
  })
  .strict()

export type StructuredConfirmationInput = z.infer<typeof structuredConfirmationSchema>
