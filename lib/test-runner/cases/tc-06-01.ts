import type { TestRunner } from '../types'
import { createCase, uniqueName, daysAgoISODate, getCaseByBrokerName } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-06-01')
  // Germany -> GDPR, 30-day response window (lib/jurisdiction-map.ts). A
  // request sent 31 days ago is one day past the deadline, exercising the
  // "breached" end of the per-regime clock (the "approaching" end is
  // already covered by TC-08-01).
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: daysAgoISODate(31),
  })

  const kase = await getCaseByBrokerName(page, brokerName)
  await page.goto('/case-tracker')
  const row = page.getByTestId(`case-row-${kase.id}`)
  const rowText = await row.innerText()

  if (!/Overdue by \d+d/.test(rowText)) {
    return { status: 'FAIL', log: `Expected the GDPR 30-day deadline clock to show the case as overdue; row text was: "${rowText.replace(/\n/g, ' ')}"` }
  }
  return { status: 'PASS', log: 'GDPR case correctly shows as overdue once the 30-day response window has passed, computed automatically from the removal request date.' }
}
