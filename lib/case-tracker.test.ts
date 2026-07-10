import { deriveCaseFields, canTransitionStage, assertConfirmable } from './case-tracker'

describe('deriveCaseFields', () => {
  it('derives GDPR for a German user with a US-based broker (broker country is not an input)', () => {
    // deriveCaseFields has no brokerCountry parameter at all, so a US broker
    // cannot influence the result — this is the "never from broker_country" rule.
    const result = deriveCaseFields({
      userCountry: 'Germany',
      removalRequestDate: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('GDPR')
    expect(result.regime).not.toBe('CCPA')
    expect(result.responseDeadlineDate.toISOString()).toBe('2026-01-31T00:00:00.000Z')
  })

  it('derives LGPD with a 15-day deadline for a Brazilian user', () => {
    const result = deriveCaseFields({
      userCountry: 'Brazil',
      removalRequestDate: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(result.mapped).toBe(true)
    if (!result.mapped) throw new Error('expected mapped result')
    expect(result.regime).toBe('LGPD')
    expect(result.responseDeadlineDate.toISOString()).toBe('2026-01-16T00:00:00.000Z')
  })
})

describe('canTransitionStage', () => {
  it('blocks complaint_eligible without jurisdiction confirmed', () => {
    const result = canTransitionStage({
      targetStage: 'complaint_eligible',
      jurisdictionConfirmedAt: null,
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(false)
  })

  it('allows complaint_eligible once jurisdiction is confirmed', () => {
    const result = canTransitionStage({
      targetStage: 'complaint_eligible',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(true)
  })

  it('blocks complaint_filed without authority confirmed', () => {
    const result = canTransitionStage({
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(false)
  })

  it('allows complaint_filed once authority is confirmed', () => {
    const result = canTransitionStage({
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: new Date(),
    })
    expect(result.ok).toBe(true)
  })
})

describe('assertConfirmable', () => {
  it('allows confirming when not yet confirmed', () => {
    expect(assertConfirmable(null, 'Jurisdiction').ok).toBe(true)
  })

  it('rejects re-confirming an already-confirmed field (immutability)', () => {
    const result = assertConfirmable(new Date('2026-01-01T00:00:00.000Z'), 'Jurisdiction')
    expect(result.ok).toBe(false)
  })
})
