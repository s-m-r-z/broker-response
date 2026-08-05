// Deterministic broad-language and commitment-verb flagging for case draft
// replies (US-15) — a fixed phrase list, not an LLM call, matching this
// repo's existing pattern of deterministic mocks over real AI calls (see
// lib/legal-ai.ts). Also used by US-19/US-21's "closure with confidence"
// intent indirectly: overstating language in a filed reply is exactly what
// creates the compliance follow-ups the evidence checklist exists to avoid.

export interface FlaggedPhrase {
  phrase: string
  index: number
  reason: string
  suggestion: string
}

interface PhraseRule {
  pattern: RegExp
  reason: string
  suggestion: string
}

// Broad/absolute phrases that overstate what was actually confirmed.
const BROAD_PHRASE_RULES: PhraseRule[] = [
  { pattern: /\ball\s+(?:your\s+)?data\b/gi, reason: 'Overstates scope — confirm exactly what was removed, not "all" data.', suggestion: 'the data covered by this request' },
  { pattern: /\bpermanently\s+delet(?:e|ed)\b/gi, reason: '"Permanently" is a stronger claim than most brokers can actually verify.', suggestion: 'deleted from the system(s) confirmed' },
  { pattern: /\bguarantee(?:s|d)?\b/gi, reason: 'Guarantees create liability the case record may not support.', suggestion: 'confirm' },
  { pattern: /\b100%\b/gi, reason: 'Absolute percentages are rarely verifiable.', suggestion: 'fully' },
  { pattern: /\bnever\s+(?:be\s+)?(?:used|shared|sold)\b/gi, reason: 'An absolute future claim — confirm only what the broker has actually committed to.', suggestion: 'will not be used, shared, or sold going forward, per their confirmation' },
  { pattern: /\bcertainly\b/gi, reason: 'Overstates certainty beyond what the record confirms.', suggestion: 'based on the broker\'s confirmation' },
  { pattern: /\bimmediately\b/gi, reason: 'Commits to a timeline the broker may not have agreed to.', suggestion: 'promptly' },
  { pattern: /\ball\s+systems\b/gi, reason: 'Overstates scope — confirm the specific systems named in the evidence record.', suggestion: 'the systems confirmed' },
]

// Commitment-expanding verbs called out explicitly in the story spec
// (US-15 AC: "delete, retain, disclose, confirm") — flagged whenever used
// without qualification, since each expands what the firm is on record as
// having promised.
const COMMITMENT_VERB_RULES: PhraseRule[] = [
  { pattern: /\bwe\s+will\s+delete\b/gi, reason: 'Commits this firm to a deletion action that is the broker\'s to perform, not ours.', suggestion: 'we have requested deletion of' },
  { pattern: /\bwe\s+will\s+retain\b/gi, reason: 'A retention commitment should come from the broker\'s evidence record, not be asserted here.', suggestion: 'per the broker\'s confirmation, they will retain' },
  { pattern: /\bwe\s+will\s+disclose\b/gi, reason: 'Disclosure commitments carry legal weight — confirm this is accurate before sending.', suggestion: 'we may disclose, where required,' },
  { pattern: /\bwe\s+confirm\b/gi, reason: '"We confirm" asserts firsthand verification — use only if independently verified, not just relayed from the broker.', suggestion: 'the broker has confirmed' },
]

const ALL_RULES = [...BROAD_PHRASE_RULES, ...COMMITMENT_VERB_RULES]

/** Scans draft text for broad/absolute language and commitment-expanding verbs, in order of appearance. */
export function flagBroadLanguage(text: string): FlaggedPhrase[] {
  if (!text) return []
  const flags: FlaggedPhrase[] = []
  for (const rule of ALL_RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) {
      flags.push({ phrase: match[0], index: match.index, reason: rule.reason, suggestion: rule.suggestion })
    }
  }
  return flags.sort((a, b) => a.index - b.index)
}

// Bracketed placeholders like [broker system name] or {{date}} left
// unresolved in a draft (US-20 AC: "Unresolved placeholders block the send
// action").
const PLACEHOLDER_PATTERN = /\[[^\]]+\]|\{\{[^}]+\}\}/g

export function findUnresolvedPlaceholders(text: string): string[] {
  if (!text) return []
  return [...text.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[0])
}
