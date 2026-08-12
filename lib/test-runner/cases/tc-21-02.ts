import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-21-02')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  // Confirm just one of five items — the checklist is left deliberately incomplete.
  await page.getByTestId('evidence-confirm-request').click()
  await page.getByTestId('evidence-confirm-request').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})

  const closeBtn = page.getByTestId('case-close-button')
  const disabled = await closeBtn.isDisabled().catch(() => false)
  if (!disabled) {
    return { status: 'FAIL', log: 'Close Case was enabled despite the evidence checklist being incomplete.' }
  }

  const bodyText = await page.locator('body').innerText()
  if (!bodyText.includes('Missing:')) {
    return { status: 'FAIL', log: 'The missing-items list was not shown alongside the disabled Close Case button.' }
  }
  return { status: 'PASS', log: 'With evidence items still outstanding, Close Case stays disabled and the missing items are listed for the counsellor.' }
}
