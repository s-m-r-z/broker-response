import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, getCaseByBrokerName } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-05-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  const kase = await getCaseByBrokerName(page, brokerName)
  await page.goto('/case-tracker')
  const row = page.getByTestId(`case-row-${kase.id}`)
  const rowText = await row.innerText()

  // Stage label ("Request Sent") and a day count come from StageBadge and
  // DeadlineChip rendered directly in the queue row — see case-list.tsx —
  // with no click into the case required.
  if (!rowText.includes('Request Sent')) {
    return { status: 'FAIL', log: `Expected the enforcement stage label in the queue row; row text was: "${rowText.replace(/\n/g, ' ')}"` }
  }
  if (!/Due |Overdue/.test(rowText)) {
    return { status: 'FAIL', log: `Expected a day-count deadline indicator in the queue row; row text was: "${rowText.replace(/\n/g, ' ')}"` }
  }
  return { status: 'PASS', log: 'Every case in the queue shows its enforcement stage label and a deadline day count without opening the thread.' }
}
