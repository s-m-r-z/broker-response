import type { TestRunner } from '../types'
import { createCase, uniqueName, daysAgoISODate, getCaseByBrokerName } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-08-01')
  // UK GDPR carries a 30-day response window (lib/jurisdiction-map.ts) — a
  // request sent 26 days ago leaves ~4 days remaining, inside the <=5-day
  // "approaching" threshold (lib/case-tracker.ts DEADLINE_APPROACHING_THRESHOLD_DAYS).
  await createCase(page, {
    userCountry: 'United Kingdom',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: daysAgoISODate(26),
  })

  const kase = await getCaseByBrokerName(page, brokerName)
  await page.goto('/case-tracker')
  const row = page.getByTestId(`case-row-${kase.id}`)
  const rowText = await row.innerText()

  if (!/Due in \d+d/.test(rowText)) {
    return { status: 'FAIL', log: `Expected a "Due in Nd" deadline warning directly in the queue row; row text was: "${rowText.replace(/\n/g, ' ')}"` }
  }
  return { status: 'PASS', log: 'A case within 5 days of its deadline shows a "Due in Nd" warning indicator directly in the queue, without opening the case.' }
}
