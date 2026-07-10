// Single source of truth for user-location -> enforcement-regime mapping.
// Jurisdiction is always derived from the requester's location, never from
// where the broker is registered — see lib/case-tracker.ts for the caller
// that enforces that rule. Add new state/country laws here only; nothing
// outside this file should know the specifics of a regime's authority,
// complaint URL, or fine.

export type RegimeCode = 'GDPR' | 'UK_GDPR' | 'CCPA' | 'VA_CDPA' | 'CO_CPA' | 'CT_CTDPA' | 'LGPD'

export interface JurisdictionResolution {
  regime: RegimeCode
  responseWindowDays: number
  filingAuthority: string
  complaintUrl: string
  maxFine: string
}

export interface JurisdictionMapped extends JurisdictionResolution {
  mapped: true
}

export interface JurisdictionUnmapped {
  mapped: false
  warning: string
}

export type JurisdictionResult = JurisdictionMapped | JurisdictionUnmapped

const EU_DPA_BY_COUNTRY: Record<string, { authority: string; url: string }> = {
  germany: { authority: 'BfDI', url: 'bfdi.bund.de' },
  france: { authority: 'CNIL', url: 'cnil.fr/en/plaintes' },
  ireland: { authority: 'DPC', url: 'forms.dataprotection.ie/contact' },
  netherlands: { authority: 'AP', url: 'autoriteitpersoonsgegevens.nl' },
  spain: { authority: 'AEPD', url: 'sedeagpd.gob.es' },
  italy: { authority: 'Garante', url: 'garanteprivacy.it/reclami' },
  poland: { authority: 'UODO', url: 'uodo.gov.pl/en' },
}

// Full EU membership, used only to decide "is this GDPR at all" — the
// authority/URL for a member state not in EU_DPA_BY_COUNTRY above is not yet
// known to this app, so those resolve as unmapped rather than guessed.
const EU_MEMBER_STATES = new Set([
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czechia', 'czech republic',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland',
  'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'poland',
  'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden',
])

const GDPR_MAX_FINE = '20000000 EUR or 4% of annual revenue, whichever is greater'

// Response-window days are only explicitly specified by the product spec for
// GDPR/UK GDPR/CCPA/LGPD. Virginia/Colorado/Connecticut are assumed at their
// statutory 45-day cure/response window pending explicit confirmation.
const US_STATE_REGIMES: Record<string, JurisdictionResolution> = {
  california: {
    regime: 'CCPA',
    responseWindowDays: 45,
    filingAuthority: 'California AG',
    complaintUrl: 'oag.ca.gov/privacy/ccpa',
    maxFine: '7500 USD per violation',
  },
  virginia: {
    regime: 'VA_CDPA',
    responseWindowDays: 45,
    filingAuthority: 'Virginia AG',
    complaintUrl: 'oag.state.va.us/consumer-protection',
    maxFine: '7500 USD per violation',
  },
  colorado: {
    regime: 'CO_CPA',
    responseWindowDays: 45,
    filingAuthority: 'Colorado AG',
    complaintUrl: 'coag.gov/resources/data-breach',
    maxFine: '20000 USD per violation',
  },
  connecticut: {
    regime: 'CT_CTDPA',
    responseWindowDays: 45,
    filingAuthority: 'Connecticut AG',
    complaintUrl: 'portal.ct.gov/AG',
    maxFine: '5000 USD per violation',
  },
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Resolves the applicable enforcement regime from the *user's* location.
 * `userCountry`/`userState` must come from the requester, never the broker.
 */
export function resolveJurisdiction(userCountry: string, userState?: string | null): JurisdictionResult {
  const country = normalize(userCountry)
  const state = userState ? normalize(userState) : null

  if (country === 'united kingdom' || country === 'uk' || country === 'united kingdom of great britain and northern ireland') {
    return {
      mapped: true,
      regime: 'UK_GDPR',
      responseWindowDays: 30,
      filingAuthority: 'ICO',
      complaintUrl: 'ico.org.uk/make-a-complaint',
      maxFine: '17500000 GBP or 4% of turnover, whichever is greater',
    }
  }

  if (country === 'brazil') {
    return {
      mapped: true,
      regime: 'LGPD',
      responseWindowDays: 15,
      filingAuthority: 'ANPD',
      complaintUrl: 'gov.br/anpd',
      maxFine: '2% of Brazil revenue, up to 50000000 BRL',
    }
  }

  if (EU_MEMBER_STATES.has(country)) {
    const dpa = EU_DPA_BY_COUNTRY[country]
    if (!dpa) {
      return {
        mapped: false,
        warning: `No filing authority mapped for EU member state "${userCountry}" yet — advise manual review.`,
      }
    }
    return {
      mapped: true,
      regime: 'GDPR',
      responseWindowDays: 30,
      filingAuthority: dpa.authority,
      complaintUrl: dpa.url,
      maxFine: GDPR_MAX_FINE,
    }
  }

  if (country === 'united states' || country === 'us' || country === 'usa') {
    if (!state) {
      return {
        mapped: false,
        warning: 'US user location requires a state — none provided. Advise manual review.',
      }
    }
    const regime = US_STATE_REGIMES[state]
    if (!regime) {
      return {
        mapped: false,
        warning: `No specific state privacy law mapped for "${userState}" — advise manual review.`,
      }
    }
    return { mapped: true, ...regime }
  }

  return {
    mapped: false,
    warning: `No enforcement regime mapped for "${userCountry}" — advise manual review.`,
  }
}
