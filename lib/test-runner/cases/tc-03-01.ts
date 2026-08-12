import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-03-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('case-complaint-pack-toggle').click()
  const bodyText = await page.locator('body').innerText()

  const checks: Array<[string, boolean]> = [
    ['filing authority "BfDI"', bodyText.includes('BfDI')],
    ['complaint URL "bfdi.bund.de"', bodyText.includes('bfdi.bund.de')],
    ['GDPR max fine', bodyText.includes('20000000 EUR')],
  ]
  const failed = checks.filter(([, ok]) => !ok).map(([label]) => label)

  if (failed.length > 0) {
    return { status: 'FAIL', log: `Complaint Pack is missing: ${failed.join(', ')}.` }
  }
  return { status: 'PASS', log: 'Complaint Pack pre-fills BfDI as filing authority, bfdi.bund.de as the complaint URL, and the GDPR max fine for a Germany-based case — no manual lookup required.' }
}
