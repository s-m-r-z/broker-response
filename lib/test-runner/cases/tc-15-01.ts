import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-15-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-reply-textarea').fill('We confirm all your data has been deleted from our systems.')

  const flag = page.getByTestId('draft-flag-0')
  const flagVisible = await flag.first().isVisible().catch(() => false)
  if (!flagVisible) {
    return { status: 'FAIL', log: 'No broad-language flag appeared for a draft containing overstated/commitment language.' }
  }

  const flaggedPhrase = (await flag.locator('p').first().innerText()).replace(/"/g, '')
  await page.getByTestId('draft-flag-replace-0').click()
  await page.waitForTimeout(500)

  const textAfter = await page.getByTestId('draft-reply-textarea').inputValue()
  if (textAfter.includes(flaggedPhrase)) {
    return { status: 'FAIL', log: `Accepting the suggested replacement did not remove the flagged phrase "${flaggedPhrase}" from the draft.` }
  }
  return { status: 'PASS', log: `Draft flagged "${flaggedPhrase}" inline with a suggested replacement; accepting it updated the draft text.` }
}
