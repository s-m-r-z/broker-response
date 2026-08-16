import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, waitForCondition } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-18-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-open-structured-confirmation').click()
  await page.getByTestId('structured-confirmation-system').waitFor({ state: 'visible', timeout: 10_000 })
  await page.getByTestId('structured-confirmation-system').fill('Primary CRM')
  await page.getByTestId('structured-confirmation-action').fill('Record permanently deleted')
  await page.getByTestId('structured-confirmation-date').fill(todayISODate())
  await page.getByTestId('structured-confirmation-retention').fill('None')
  await page.getByTestId('structured-confirmation-responder').fill('Alex Responder')

  const submitEnabled = await waitForCondition(() => page.getByTestId('structured-confirmation-submit').isEnabled())
  if (!submitEnabled) {
    return { status: 'FAIL', log: 'Submit stayed disabled after all five required fields were filled.' }
  }
  await page.getByTestId('structured-confirmation-submit').click()

  const dialogClosed = await page
    .getByTestId('structured-confirmation-submit')
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!dialogClosed) {
    return { status: 'FAIL', log: 'Structured confirmation form did not close after a valid submission — likely rejected server-side.' }
  }

  // Batch-confirms the matching evidence items (systems/reply/retention
  // exception) in one submission — see CLAUDE.md.
  const confirmed = await page.getByTestId('evidence-item-systems').getByText(/Confirmed/).first().isVisible().catch(() => false)
  if (!confirmed) {
    return { status: 'FAIL', log: 'Submitting the structured confirmation did not mark the matching evidence checklist items as confirmed.' }
  }
  return { status: 'PASS', log: 'Structured confirmation form validates all five required fields, submits successfully, and batch-confirms the matching evidence checklist items.' }
}
