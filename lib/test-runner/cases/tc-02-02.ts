import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-02-02')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
    // contractFileRef intentionally omitted
  })

  const flagged = await page.getByTestId('case-missing-contract-file').isVisible().catch(() => false)
  if (!flagged) {
    return { status: 'FAIL', log: 'Expected the missing-reference-document warning to be shown when no contract file was provided at intake.' }
  }
  return { status: 'PASS', log: 'Case created without a reference document — the missing-document warning is shown on the case detail view.' }
}
