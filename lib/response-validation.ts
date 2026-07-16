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
