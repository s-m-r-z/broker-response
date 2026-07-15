// Zod schemas for case-tracker API payloads.
//
// createCaseSchema is deliberately `.strict()` and only accepts the raw
// intake fields (user location, broker name/country, removal request date).
// applicableRegime/filingAuthority/complaintUrl/maxFine/responseDeadlineDate
// are never client-settable — they only ever come from
// lib/case-tracker.ts's deriveCaseFields(), which reads user location and
// has no brokerCountry parameter to derive from in the first place.

import { z } from 'zod'

export const createCaseSchema = z
  .object({
    userCountry: z.string().min(1),
    userState: z.string().min(1).optional(),
    brokerName: z.string().min(1),
    brokerCountry: z.string().min(1),
    removalRequestDate: z.string().datetime({ message: 'removalRequestDate must be ISO 8601 UTC' }),
    sourceResponseId: z.string().min(1).optional(),
  })
  .strict()

export type CreateCaseInput = z.infer<typeof createCaseSchema>

export const advanceCaseSchema = z
  .object({
    note: z.string().min(1).optional(),
  })
  .strict()

export type AdvanceCaseInput = z.infer<typeof advanceCaseSchema>
