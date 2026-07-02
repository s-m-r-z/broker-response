// Generates and rechecks legal-workbook content. Today this is backed by a
// deterministic mock so the feature works with zero API cost. Swap
// `getLegalAiProvider()` to return a real provider (e.g. one that calls the
// Claude API) once ANTHROPIC_API_KEY is wired up — every caller in the app
// only depends on the LegalAiProvider shape below, not on how it's produced.

export interface GeneratedClause {
  category: string
  title: string
  citation: string
  text: string
  sourceUrl?: string
}

export interface GeneratedRegime {
  name: string
  description: string
  clauses: GeneratedClause[]
}

export interface RecheckResult {
  changed: boolean
  proposedTitle?: string
  proposedCitation?: string
  proposedText?: string
  changeSummary?: string
}

export interface LegalAiProvider {
  /** Human-readable label stored on generated rows, e.g. "mock-v1" or "claude-sonnet-5". */
  readonly modelLabel: string
  generateRegime(input: { country: string; state?: string | null; regimeName: string }): Promise<GeneratedRegime>
  recheckClause(input: {
    country: string
    state?: string | null
    regimeName: string
    clause: { category: string; title: string; citation: string; text: string }
  }): Promise<RecheckResult>
}

const CATEGORY_TEMPLATES: { category: string; title: string }[] = [
  { category: 'RIGHT_TO_ERASURE', title: 'Right to erasure / deletion' },
  { category: 'RESPONSE_DEADLINE', title: 'Deadline to respond to a request' },
  { category: 'VERIFICATION_REQUIREMENTS', title: 'Identity verification requirements' },
  { category: 'EXEMPTIONS', title: 'Exemptions to the deletion obligation' },
  { category: 'PENALTIES', title: 'Penalties for non-compliance' },
  { category: 'ENFORCEMENT_AUTHORITY', title: 'Enforcement authority' },
]

// Placeholder text only — not sourced from an actual statute. Every clause
// this produces is flagged aiGenerated + unverified until a human confirms it.
function mockGenerateRegime(input: { country: string; state?: string | null; regimeName: string }): GeneratedRegime {
  const place = input.state ? `${input.state}, ${input.country}` : input.country
  return {
    name: input.regimeName,
    description: `Placeholder overview of ${input.regimeName} (${place}). Generated as dummy data — not yet verified by legal counsel.`,
    clauses: CATEGORY_TEMPLATES.map((t, i) => ({
      category: t.category,
      title: t.title,
      citation: `${input.regimeName} Art. ${i + 1} (placeholder)`,
      text: `[Placeholder] Under ${input.regimeName}, this section would summarize "${t.title.toLowerCase()}" as it applies in ${place}. Replace with verified statute text and a real citation before relying on this in broker correspondence.`,
    })),
  }
}

async function mockRecheckClause(input: {
  country: string
  state?: string | null
  regimeName: string
  clause: { category: string; title: string; citation: string; text: string }
}): Promise<RecheckResult> {
  return {
    changed: true,
    proposedTitle: input.clause.title,
    proposedCitation: input.clause.citation,
    proposedText: `${input.clause.text}\n\n[Simulated update] This is placeholder text produced by the mock recheck — no live law-monitoring is wired up yet. Accept to see how the review flow updates the clause, or reject to discard.`,
    changeSummary: 'Simulated recheck (mock provider) — flags every clause as potentially changed so the accept/reject flow can be exercised without a live model.',
  }
}

const mockProvider: LegalAiProvider = {
  modelLabel: 'mock-v1',
  generateRegime: async (input) => mockGenerateRegime(input),
  recheckClause: async (input) => mockRecheckClause(input),
}

export function getLegalAiProvider(): LegalAiProvider {
  // TODO: once ANTHROPIC_API_KEY is available, return a provider that calls
  // the Claude API here instead, keeping the LegalAiProvider shape.
  return mockProvider
}
