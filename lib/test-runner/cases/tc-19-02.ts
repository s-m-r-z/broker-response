import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-19-02')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  // Leave the checklist deliberately incomplete — confirm only one of five.
  await page.getByTestId('evidence-confirm-request').click()
  await page.getByTestId('evidence-confirm-request').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})

  const closeBtn = page.getByTestId('case-close-button')
  const disabled = await closeBtn.isDisabled().catch(() => false)
  if (!disabled) {
    return { status: 'FAIL', log: 'Evidence assembly/closure was not blocked despite missing checklist items.' }
  }
  const bodyText = await page.locator('body').innerText()
  if (!bodyText.includes('Missing:')) {
    return { status: 'FAIL', log: 'Missing evidence items were not identified to the user.' }
  }
  return { status: 'PASS', log: 'Closure (evidence assembly) is blocked with the missing items identified when the completeness checklist is not fully confirmed.' }
}
