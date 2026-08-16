import type { TestRunner } from '../types'
import { uniqueName } from '../helpers'

// The literal AC ("Type/Jurisdiction/Urgency/Identity" labels) doesn't
// map 1:1 onto this app's fields — there's no Urgency/Identity field on
// BrokerResponse, and classification itself happens in an external
// pipeline this app never runs (see CLAUDE.md). What's genuinely
// implemented and testable: a response pushed via /api/ingest with a tag
// and jurisdiction already set is labelled in the list — TagBadge +
// jurisdiction text — before anyone opens the thread.
export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-09-01')
  const res = await page.context().request.post('/api/ingest', {
    data: {
      brokerName,
      brokerEmail: 'privacy@example-broker.test',
      responseContent: 'We require additional information to process this request.',
      tag: 'NEEDS_MORE_INFO',
      jurisdiction: 'UK GDPR',
    },
  })
  if (!res.ok()) {
    return { status: 'FAIL', log: `/api/ingest returned ${res.status()} instead of creating the response.` }
  }
  const created = await res.json()

  await page.goto('/responses')
  const row = page.getByTestId(`response-row-${created.id}`)
  const rowVisible = await row.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false)
  if (!rowVisible) {
    return { status: 'FAIL', log: 'Ingested response did not appear in the dashboard list.' }
  }
  const rowText = await row.innerText()
  if (!rowText.includes('Needs More Info') || !rowText.includes('UK GDPR')) {
    return { status: 'FAIL', log: `Expected tag and jurisdiction labels visible in the row without opening it; row text was: "${rowText.replace(/\n/g, ' ')}"` }
  }
  return { status: 'PASS', log: 'A response pushed via /api/ingest is labelled with its tag and jurisdiction directly in the list, before the thread is opened.' }
}
