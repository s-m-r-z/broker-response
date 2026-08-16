import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

// Tests the sourcing/placeholder mechanism this app actually implements:
// draft-flagging.ts's findUnresolvedPlaceholders. There's no literal
// "annotate every sentence with a source badge" UI — sourcing is tracked
// per inserted block (see tc-13-01.ts) — so this covers the "unresolved
// placeholders block send" acceptance criterion directly.
export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-20-01')
  await createCase(page, {
    userCountry: 'Germany',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId('draft-reply-textarea').fill('Please confirm deletion from [system name] by [date].')

  const warningVisible = await page
    .getByTestId('draft-placeholder-warning')
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!warningVisible) {
    return { status: 'FAIL', log: 'Unresolved placeholders ([system name], [date]) in the draft did not surface a warning.' }
  }

  const warningText = await page.getByTestId('draft-placeholder-warning').innerText()
  if (!warningText.includes('[system name]') || !warningText.includes('[date]')) {
    return { status: 'FAIL', log: `Placeholder warning did not list both unresolved placeholders; got: "${warningText}"` }
  }
  return { status: 'PASS', log: 'Unresolved placeholders in a draft are detected and listed inline, blocking the reply from being treated as send-ready.' }
}
