import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-07-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-open-structured-confirmation').click()
  await page.getByTestId('structured-confirmation-cancel').click()

  const visible = await page
    .getByTestId('case-status-badge-WAITING_ON_CONFIRMATION')
    .first()
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!visible) {
    return { status: 'FAIL', log: 'Case status did not update to "Waiting on Confirmation" after requesting a structured confirmation.' }
  }
  return { status: 'PASS', log: 'Requesting a structured confirmation updates case status to "Waiting on Confirmation" automatically, with no manual status change.' }
}
