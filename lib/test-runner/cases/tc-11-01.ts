import type { TestRunner } from '../types'
import { uniqueName } from '../helpers'

// isHoldingReply is a classifier-set signal this app only renders (see
// CLAUDE.md) — there's no deadline clock or status field on BrokerResponse
// itself for it to keep "unchanged" (that framing applies to a Case, not a
// response). What's genuinely implemented: the badge renders whenever the
// flag is set on ingest.
export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-11-01')
  const res = await page.context().request.post('/api/ingest', {
    data: {
      brokerName,
      brokerEmail: 'privacy@example-broker.test',
      responseContent: 'Thank you for your message. We are looking into this and will come back shortly.',
      tag: 'NEEDS_CONFIRMATION',
      isHoldingReply: true,
    },
  })
  if (!res.ok()) {
    return { status: 'FAIL', log: `/api/ingest returned ${res.status()} instead of creating the response.` }
  }
  const created = await res.json()

  await page.goto('/responses')
  const row = page.getByTestId(`response-row-${created.id}`)
  await row.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {})
  const badgeVisible = await row.getByTestId('holding-reply-badge').isVisible().catch(() => false)
  if (!badgeVisible) {
    return { status: 'FAIL', log: 'Response ingested with isHoldingReply=true did not show the holding-reply badge in the list.' }
  }
  return { status: 'PASS', log: 'A response flagged by the classifier as a non-substantive holding reply is visibly badged in the list.' }
}
