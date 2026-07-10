import { resolveJurisdiction } from './jurisdiction-map'

describe('resolveJurisdiction', () => {
  it('derives GDPR for a German user regardless of broker country', () => {
    const result = resolveJurisdiction('Germany')
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('GDPR')
    expect(result.regime).not.toBe('CCPA')
    expect(result.filingAuthority).toBe('BfDI')
    expect(result.responseWindowDays).toBe(30)
  })

  it('routes a UK user to ICO, not an EU DPA', () => {
    const result = resolveJurisdiction('United Kingdom')
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('UK_GDPR')
    expect(result.filingAuthority).toBe('ICO')
    expect(result.complaintUrl).toBe('ico.org.uk/make-a-complaint')
  })

  it('routes a California user to the CA AG with a 45-day deadline', () => {
    const result = resolveJurisdiction('United States', 'California')
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('CCPA')
    expect(result.filingAuthority).toBe('California AG')
    expect(result.responseWindowDays).toBe(45)
  })

  it('routes a Brazilian user to ANPD with a 15-day deadline', () => {
    const result = resolveJurisdiction('Brazil')
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('LGPD')
    expect(result.filingAuthority).toBe('ANPD')
    expect(result.responseWindowDays).toBe(15)
  })

  it('surfaces a manual-review warning for an unsupported US state', () => {
    const result = resolveJurisdiction('United States', 'Texas')
    expect(result.mapped).toBe(false)
    if (result.mapped) throw new Error('expected unmapped result')
    expect(result.warning).toMatch(/manual review/i)
  })
})
