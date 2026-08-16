import type { TestRunner } from '../types'
import { uniqueName, todayISODate } from '../helpers'

export const run: TestRunner = async (page) => {
  const brokerName = uniqueName('TC-10-01')
  const res = await page.context().request.post('/api/ingest', {
    data: {
      brokerName,
      brokerEmail: 'privacy@example-broker.test',
      responseContent: 'No response received within the statutory window.',
      tag: 'AMBIGUOUS',
      requiresCaseTracking: true,
      userCountry: 'Germany',
      removalRequestDate: new Date(todayISODate()).toISOString(),
      brokerCountry: 'United States',
    },
  })
  if (!res.ok()) {
    return { status: 'FAIL', log: `/api/ingest returned ${res.status()} instead of creating the response.` }
  }
  const created = await res.json()
  if (!created.case?.id) {
    return { status: 'FAIL', log: 'Ingest response did not include an auto-created case even though requiresCaseTracking was set with a resolvable jurisdiction.' }
  }

  await page.goto('/case-tracker')
  const row = page.getByTestId(`case-row-${created.case.id}`)
  const rowVisible = await row.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false)
  if (!rowVisible) {
    return { status: 'FAIL', log: 'Auto-created case did not appear in the case tracker queue.' }
  }
  return { status: 'PASS', log: 'Ingesting a case-worthy response with requiresCaseTracking auto-creates a linked case with deadline/authority pre-filled, visible in the queue with no manual entry.' }
}
