import type { TestRunner } from './types'
import { run as tc0101 } from './cases/tc-01-01'
import { run as tc0202 } from './cases/tc-02-02'
import { run as tc0301 } from './cases/tc-03-01'
import { run as tc0701 } from './cases/tc-07-01'
import { run as tc0801 } from './cases/tc-08-01'
import { run as tc1501 } from './cases/tc-15-01'
import { run as tc2101 } from './cases/tc-21-01'
import { run as tc2102 } from './cases/tc-21-02'
import { run as tc2501 } from './cases/tc-25-01'
import { run as tc2502 } from './cases/tc-25-02'

// One entry per automatable TestCase.tcId (see lib/test-cases-data.ts) — the
// run API route 404s/409s if a tcId isn't registered here, so this and the
// `automatable` flag in the seed data must stay in sync.
export const TEST_RUNNERS: Record<string, TestRunner> = {
  'TC-01-01': tc0101,
  'TC-02-02': tc0202,
  'TC-03-01': tc0301,
  'TC-07-01': tc0701,
  'TC-08-01': tc0801,
  'TC-15-01': tc1501,
  'TC-21-01': tc2101,
  'TC-21-02': tc2102,
  'TC-25-01': tc2501,
  'TC-25-02': tc2502,
}
