import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, waitForCondition } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-25-02')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-reply-textarea').fill('Original approved draft text.')
  await page.getByTestId('draft-save-button').click()
  await page.getByTestId('draft-reviewer-name').fill('Jordan Reviewer')

  const approveEnabled = await waitForCondition(() => page.getByTestId('draft-approve-button').isEnabled())
  if (!approveEnabled) {
    return { status: 'FAIL', log: 'Approve button never became enabled after saving the initial draft and entering a reviewer name.' }
  }
  await page.getByTestId('draft-approve-button').click()

  // .first() — see tc-25-01.ts: this text legitimately appears twice (draft
  // panel badge + case history entry).
  const approved = await page
    .getByText('Approved by Jordan Reviewer')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!approved) {
    return { status: 'FAIL', log: 'Draft was not confirmed as approved before attempting the post-approval edit.' }
  }

  await page.getByTestId('draft-reply-textarea').fill('Original approved draft text. Plus an edit made after approval.')
  await page.getByTestId('draft-save-button').click()

  const stale = await page
    .getByText('Changed since approval')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!stale) {
    return { status: 'FAIL', log: 'Editing the draft after approval did not surface the "Changed since approval — re-approve required" notice.' }
  }
  return { status: 'PASS', log: 'Editing an approved draft correctly marks the approval stale ("Changed since approval — re-approve required"), which blocks filing until it is re-approved.' }
}
