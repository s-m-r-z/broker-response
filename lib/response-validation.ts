// Zod schemas for broker-response API payloads that aren't handled by the
// looser, pre-existing app/api/actions/route.ts (untyped body, no schema).

import { z } from 'zod'
import { STAKEHOLDER_CONFIG } from './constants'

const STAKEHOLDER_VALUES = Object.keys(STAKEHOLDER_CONFIG) as [string, ...string[]]

export const assignStakeholderSchema = z
  .object({
    assignedTo: z.enum(STAKEHOLDER_VALUES),
    note: z.string().min(1).optional(),
  })
  .strict()

export type AssignStakeholderInput = z.infer<typeof assignStakeholderSchema>

// /api/ingest is external-facing (pushed by the classification pipeline —
// see CLAUDE.md), so this is intentionally NOT .strict(): unknown fields
// from the classifier are ignored rather than rejected. isHoldingReply and
// the case-tracking fields are the classifier's signals, not something this
// app derives itself — it only renders/acts on what's passed in.
export const ingestResponseSchema = z.object({
  brokerName: z.string().min(1),
  brokerEmail: z.string().min(1),
  responseContent: z.string().min(1),
  tag: z.string().min(1),
  tier: z.string().optional(),
  website: z.string().optional(),
  jurisdiction: z.string().optional(),
  category: z.string().optional(),
  isHoldingReply: z.boolean().optional(),
  // When the classifier determines this response represents a broker
  // non-response/denial that should be enforcement-tracked, it can pass
  // requiresCaseTracking plus the requester's own location (never the
  // broker's — see lib/jurisdiction-map.ts) to auto-create a linked Case.
  requiresCaseTracking: z.boolean().optional(),
  userCountry: z.string().min(1).optional(),
  userState: z.string().min(1).optional(),
  removalRequestDate: z.string().datetime({ message: 'removalRequestDate must be ISO 8601 UTC' }).optional(),
  brokerCountry: z.string().min(1).optional(),
})

export type IngestResponseInput = z.infer<typeof ingestResponseSchema>
