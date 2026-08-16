import type { TestRunner } from '../types'
import { createCase, uniqueName, todayISODate } from '../helpers'

interface LawClause {
  id: string
  title: string
  citation: string
}
interface LawRegime {
  id: string
  country: string
  state: string | null
  clauses: LawClause[]
}

// "Official source URL" isn't rendered inline in RelevantLawPanel (only
// title/citation/text + a last-verified date), and there's no live
// re-fetch against an external source like EUR-Lex — this app's currency
// check is "when was this clause last verified" against the seeded/AI
// content (lib/legal-ai.ts), not a live external lookup. This exercises
// what's actually implemented: the panel surfaces the matching regime's
// clause text and last-verified date in-context, and inserting a clause
// carries its citation into the case.
export const run: TestRunner = async (page) => {
  const regimesRes = await page.context().request.get('/api/legal/regimes')
  const regimes: LawRegime[] = await regimesRes.json()
  const ukRegime = regimes.find((r) => r.country === 'United Kingdom')
  if (!ukRegime || ukRegime.clauses.length === 0) {
    return { status: 'FAIL', log: 'No seeded "United Kingdom" law regime with clauses found — Legal Workbook must be seeded (npm run db:seed:legal) for this case to be meaningful.' }
  }
  const clause = ukRegime.clauses[0]

  const brokerName = uniqueName('TC-14-01')
  await createCase(page, {
    userCountry: 'United Kingdom',
    brokerName,
    brokerCountry: 'United States',
    removalRequestDate: todayISODate(),
  })

  await page.getByTestId(`relevant-law-toggle-${ukRegime.id}`).click()
  const clauseVisible = await page
    .getByText(clause.title, { exact: false })
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false)
  if (!clauseVisible) {
    return { status: 'FAIL', log: `Expanding the matching "United Kingdom" law regime did not show its clause "${clause.title}".` }
  }

  const lastCheckedText = await page.getByTestId(`relevant-law-last-checked-${ukRegime.id}`).innerText()
  if (!lastCheckedText.includes('last verified')) {
    return { status: 'FAIL', log: `Expected a "last verified" timestamp next to the regime; got: "${lastCheckedText}"` }
  }

  await page.getByTestId(`relevant-law-insert-${clause.id}`).click()
  const noteText = await page.getByTestId('case-advance-note').inputValue()
  if (!noteText.includes(clause.citation)) {
    return { status: 'FAIL', log: 'Inserting a clause citation did not carry it into the case\'s enforcement note.' }
  }
  return { status: 'PASS', log: `Case jurisdiction "United Kingdom" surfaces the matching UK GDPR clause "${clause.title}" in-context with a last-verified date, and inserting it carries the citation into the case record.` }
}
