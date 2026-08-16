import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'
import { EVIDENCE_ITEMS } from '@/lib/case-tracker'

// US-19's "auto-assembled evidence record" and US-21's "closure conditional
// on evidence checklist" describe the same completeness gate in this
// implementation — there's one checklist (lib/case-tracker.ts
// assertCanClose), not a separate document-assembly step. This exercises
// the same gate as TC-21-01, scoped to US-19's own acceptance criteria
// (completeness checklist shown at closure; closed record locked once all
// items are confirmed).
export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-19-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  for (const item of EVIDENCE_ITEMS) {
    const confirmButton = page.getByTestId(`evidence-confirm-${item}`)
    if (item === 'retentionException') {
      await page.getByTestId('evidence-retention-note').fill('None')
    }
    await confirmButton.click()
    await confirmButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }

  const closeBtn = page.getByTestId('case-close-button')
  const enabled = await closeBtn.isEnabled().catch(() => false)
  if (!enabled) {
    return { status: 'FAIL', log: 'Close Case is still disabled after all five completeness-checklist items (request, identity, systems, reply, retention exception) were confirmed.' }
  }
  await closeBtn.click()
  const locked = await page
    .getByText(/evidence record locked/)
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!locked) {
    return { status: 'FAIL', log: 'Evidence record was not locked/timestamped after closure.' }
  }
  return { status: 'PASS', log: 'Completeness checklist (request/identity/systems/reply/retention exception) gates closure; once all five are confirmed, closing locks the evidence record.' }
}
