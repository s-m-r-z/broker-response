import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, waitForCondition } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-25-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-reply-textarea').fill('Draft reply body for TC-25-01.')
  await page.getByTestId('draft-save-button').click()
  await page.getByTestId('draft-reviewer-name').fill('Jordan Reviewer')

  // draft-approve-button is disabled while `unsaved` is true (see
  // draft-reply-panel.tsx) — waiting for it to become enabled is really
  // waiting for the save round-trip to finish, without a race against a
  // fixed sleep or against the save button's own transient disabled state.
  const approveEnabled = await waitForCondition(() => page.getByTestId('draft-approve-button').isEnabled())
  if (!approveEnabled) {
    return { status: 'FAIL', log: 'Approve button never became enabled after saving the draft and entering a reviewer name.' }
  }
  await page.getByTestId('draft-approve-button').click()

  // .first() — the reviewer name also gets logged verbatim to case history
  // ("Approved by Jordan Reviewer" as the CaseActionLog note), so this text
  // legitimately appears twice: the draft panel's approval badge and the
  // history entry below it. Either one confirms the approval landed.
  const approved = await page
    .getByText('Approved by Jordan Reviewer')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!approved) {
    return { status: 'FAIL', log: 'Approving the saved draft did not show "Approved by Jordan Reviewer" on the draft panel.' }
  }
  return { status: 'PASS', log: 'Approving a saved draft with a reviewer name locks the version and shows the approval confirmation with reviewer name and timestamp.' }
}
