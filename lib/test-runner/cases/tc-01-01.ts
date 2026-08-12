import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'
import { REGIME_LABELS } from '@/lib/constants'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-01-01')
  await createCase(page, {
    userCountry: 'United Kingdom',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  const regimeVisible = await page.getByText(REGIME_LABELS.UK_GDPR, { exact: true }).first().isVisible().catch(() => false)
  const draftVisible = await page.getByTestId('draft-reply-textarea').isVisible().catch(() => false)

  if (!regimeVisible) {
    return { status: 'FAIL', log: `Expected regime badge "${REGIME_LABELS.UK_GDPR}" was not visible after creating a case with user country "United Kingdom".` }
  }
  if (!draftVisible) {
    return { status: 'FAIL', log: 'Draft reply field was not visible on the case detail view.' }
  }
  return {
    status: 'PASS',
    log: `Case created with user country "United Kingdom" — regime badge shows "${REGIME_LABELS.UK_GDPR}" and the draft field is present.`,
  }
}
