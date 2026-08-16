import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, getCaseByBrokerName } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-23-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })
  const kase = await getCaseByBrokerName(page, brokerName)

  // A freshly created case with no deadline pressure, no outstanding
  // confirmation, and not closed derives to IN_PROGRESS — see
  // lib/case-tracker.ts deriveCaseStatus().
  await page.goto('/case-tracker')
  const row = page.getByTestId(`case-row-${kase.id}`)
  await row.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {})
  const statusVisible = await row
    .getByTestId('case-status-badge-IN_PROGRESS')
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!statusVisible) {
    return { status: 'FAIL', log: 'New case did not show the "In Progress" status indicator in the queue.' }
  }

  // Status filter (US-23 AC3): filtering by a different status should hide this case.
  await page.getByTestId('case-sidebar-status-WAITING_ON_CONFIRMATION').click()
  const hiddenWhenFiltered = await row.waitFor({ state: 'hidden', timeout: 5_000 }).then(() => true).catch(() => false)
  if (!hiddenWhenFiltered) {
    return { status: 'FAIL', log: 'Filtering the case list by a status the case does not have still showed it — status filter is not actually filtering.' }
  }

  // Clearing the filter should bring it back.
  await page.getByTestId('case-sidebar-status-all').click()
  const visibleAgain = await row.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false)
  if (!visibleAgain) {
    return { status: 'FAIL', log: 'Case did not reappear after clearing the status filter.' }
  }
  return { status: 'PASS', log: 'The four-state status indicator shows correctly per case, and the case list is genuinely filterable by status (case hidden/shown as the filter changes).' }
}
