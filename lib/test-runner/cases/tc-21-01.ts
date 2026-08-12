import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'
import { EVIDENCE_ITEMS } from '@/lib/case-tracker'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-21-01')
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
    // Once confirmed, the button is replaced by a "Confirmed …" label — see
    // evidence-checklist.tsx — so waiting for it to detach is waiting for
    // the confirm PATCH + refetch to actually land, not a fixed guess.
    await confirmButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }

  const closeBtn = page.getByTestId('case-close-button')
  const enabled = await closeBtn.isEnabled().catch(() => false)
  if (!enabled) {
    return { status: 'FAIL', log: 'Close Case is still disabled after confirming all five evidence checklist items.' }
  }

  await closeBtn.click()
  const locked = await page
    .getByTestId('enforcement-locked-notice')
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!locked) {
    return { status: 'FAIL', log: 'Case did not become read-only (enforcement lock notice not shown) after closing.' }
  }
  return { status: 'PASS', log: 'Confirming all five evidence items enables Close Case; closing the case then locks it as read-only, with the closure recorded.' }
}
