import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate, waitForCondition, getCaseByBrokerName } from '../helpers'

export const run: TestRunner = async (page) => {
  const priorBrokerName = uniqueName('TC-13-01-precedent')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName: priorBrokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })
  await page.getByTestId('draft-reply-textarea').fill('Precedent reply text for TC-13-01.')
  await page.getByTestId('draft-save-button').click()
  await waitForCondition(async () => (await page.getByTestId('draft-reply-textarea').inputValue()) === 'Precedent reply text for TC-13-01.')
  const priorCase = await getCaseByBrokerName(page, priorBrokerName)

  const newBrokerName = uniqueName('TC-13-01-new')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName: newBrokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  const snippetVisible = await page
    .getByTestId(`draft-snippet-${priorCase.id}`)
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!snippetVisible) {
    return { status: 'FAIL', log: 'A same-jurisdiction case with a saved draft did not surface as a "Start From Precedent" snippet on a new case in the same jurisdiction.' }
  }

  await page.getByTestId(`draft-snippet-insert-${priorCase.id}`).click()
  const inserted = await waitForCondition(async () => {
    const text = await page.getByTestId('draft-reply-textarea').inputValue()
    return text.includes('Precedent reply text for TC-13-01.')
  })
  if (!inserted) {
    return { status: 'FAIL', log: 'Inserting the precedent snippet did not add its text to the new case\'s draft.' }
  }
  return { status: 'PASS', log: 'A prior same-jurisdiction draft is surfaced as precedent on a new case, and inserting it copies the text into the draft field.' }
}
