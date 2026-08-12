import type { Page } from 'playwright'

/** yyyy-mm-dd for today (UTC), matching the <input type="date"> format new-case-dialog.tsx expects. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

/** yyyy-mm-dd for N days before today (UTC). */
export function daysAgoISODate(n: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

/** Distinguishes runs across repeated executions of the same test case. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`
}

export interface CreateCaseOptions {
  userCountry: string
  userState?: string
  brokerName: string
  brokerCountry: string
  removalRequestDate: string
  contractFileRef?: string
  dataFlowNote?: string
}

/** Drives the New Case dialog on /case-tracker and waits for the created case's detail view to load. */
export async function createCase(page: Page, opts: CreateCaseOptions): Promise<void> {
  await page.goto('/case-tracker')
  await page.getByTestId('case-list-new-case').click()
  await page.getByTestId('new-case-user-country').fill(opts.userCountry)
  if (opts.userState) await page.getByTestId('new-case-user-state').fill(opts.userState)
  await page.getByTestId('new-case-broker-name').fill(opts.brokerName)
  await page.getByTestId('new-case-broker-country').fill(opts.brokerCountry)
  await page.getByTestId('new-case-removal-request-date').fill(opts.removalRequestDate)
  if (opts.contractFileRef) await page.getByTestId('new-case-contract-file').fill(opts.contractFileRef)
  if (opts.dataFlowNote) await page.getByTestId('new-case-data-flow-note').fill(opts.dataFlowNote)
  await page.getByTestId('new-case-submit').click()
  await page.getByTestId('draft-reply-textarea').waitFor({ state: 'visible', timeout: 15_000 })
}

/** Polls `check` until it returns true or `timeoutMs` elapses. Used for state (e.g. a button re-enabling) that Playwright's built-in waitFor states don't cover. */
export async function waitForCondition(check: () => Promise<boolean>, timeoutMs = 5_000, intervalMs = 150): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check().catch(() => false)) return true
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}

/** Looks up a just-created case's id via the same API the UI uses, keyed by the unique broker name passed to createCase. */
export async function getCaseByBrokerName(page: Page, brokerName: string): Promise<{ id: string }> {
  const res = await page.context().request.get('/api/cases')
  const cases: Array<{ id: string; brokerName: string }> = await res.json()
  const match = cases.find((c) => c.brokerName === brokerName)
  if (!match) throw new Error(`No case found with brokerName "${brokerName}"`)
  return match
}
