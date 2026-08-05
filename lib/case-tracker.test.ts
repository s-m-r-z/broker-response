import { deriveCaseFields, canTransitionStage, assertConfirmable, getNextStage, ENFORCEMENT_STAGES, assertDraftApprovedForFiling, deriveCaseStatus } from './case-tracker'

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

describe('getNextStage', () => {
  it('returns the immediate successor for every non-terminal stage', () => {
    for (let i = 0; i < ENFORCEMENT_STAGES.length - 1; i++) {
      expect(getNextStage(ENFORCEMENT_STAGES[i])).toBe(ENFORCEMENT_STAGES[i + 1])
    }
  })

  it('returns null at the terminal stage', () => {
    expect(getNextStage('complaint_filed')).toBeNull()
  })
})

describe('canTransitionStage', () => {
  it('blocks complaint_eligible without jurisdiction confirmed', () => {
    const result = canTransitionStage({
      currentStage: 'followup_sent',
      targetStage: 'complaint_eligible',
      jurisdictionConfirmedAt: null,
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(false)
  })

  it('allows complaint_eligible once jurisdiction is confirmed', () => {
    const result = canTransitionStage({
      currentStage: 'followup_sent',
      targetStage: 'complaint_eligible',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(true)
  })

  it('blocks complaint_filed without authority confirmed', () => {
    const result = canTransitionStage({
      currentStage: 'complaint_eligible',
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(false)
  })

  it('blocks complaint_filed when authority is confirmed but the draft is not approved', () => {
    const result = canTransitionStage({
      currentStage: 'complaint_eligible',
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: new Date(),
    })
    expect(result.ok).toBe(false)
  })

  it('allows complaint_filed once authority is confirmed and the current draft is approved', () => {
    const result = canTransitionStage({
      currentStage: 'complaint_eligible',
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: new Date(),
      draftReply: 'Final approved text.',
      approvedDraftText: 'Final approved text.',
    })
    expect(result.ok).toBe(true)
  })

  it('allows each unconditional adjacent transition with no confirmations set', () => {
    const pairs: [import('./case-tracker').EnforcementStage, import('./case-tracker').EnforcementStage][] = [
      ['request_sent', 'deadline_approaching'],
      ['deadline_approaching', 'deadline_passed'],
      ['deadline_passed', 'followup_sent'],
    ]
    for (const [currentStage, targetStage] of pairs) {
      const result = canTransitionStage({
        currentStage,
        targetStage,
        jurisdictionConfirmedAt: null,
        authorityConfirmedAt: null,
      })
      expect(result.ok).toBe(true)
    }
  })

  it('blocks skipping ahead even when both confirmations are set', () => {
    const result = canTransitionStage({
      currentStage: 'request_sent',
      targetStage: 'complaint_filed',
      jurisdictionConfirmedAt: new Date(),
      authorityConfirmedAt: new Date(),
    })
    expect(result.ok).toBe(false)
  })

  it('blocks moving backward', () => {
    const result = canTransitionStage({
      currentStage: 'deadline_approaching',
      targetStage: 'request_sent',
      jurisdictionConfirmedAt: null,
      authorityConfirmedAt: null,
    })
    expect(result.ok).toBe(false)
  })
})

describe('assertDraftApprovedForFiling', () => {
  it('blocks when nothing has been approved yet', () => {
    expect(assertDraftApprovedForFiling('Some draft text.', null).ok).toBe(false)
  })

  it('blocks when the draft has changed since approval', () => {
    const result = assertDraftApprovedForFiling('Edited after approval.', 'Original approved text.')
    expect(result.ok).toBe(false)
  })

  it('allows filing when the current draft exactly matches the approved snapshot', () => {
    const result = assertDraftApprovedForFiling('Approved text.', 'Approved text.')
    expect(result.ok).toBe(true)
  })
})

describe('deriveCaseStatus', () => {
  const now = new Date('2026-06-15T00:00:00.000Z')

  it('returns COMPLETE when closed, regardless of anything else', () => {
    const status = deriveCaseStatus(
      { closedAt: new Date(), confirmationRequestedAt: new Date(), responseDeadlineDate: '2026-06-01T00:00:00.000Z' },
      now
    )
    expect(status).toBe('COMPLETE')
  })

  it('returns WAITING_ON_CONFIRMATION when a request is outstanding and the case is not closed', () => {
    const status = deriveCaseStatus(
      { closedAt: null, confirmationRequestedAt: new Date(), responseDeadlineDate: '2026-07-01T00:00:00.000Z' },
      now
    )
    expect(status).toBe('WAITING_ON_CONFIRMATION')
  })

  it('returns DEADLINE_APPROACHING within the 5-day threshold with no outstanding request', () => {
    const status = deriveCaseStatus(
      { closedAt: null, confirmationRequestedAt: null, responseDeadlineDate: '2026-06-18T00:00:00.000Z' },
      now
    )
    expect(status).toBe('DEADLINE_APPROACHING')
  })

  it('returns DEADLINE_APPROACHING for a deadline already in the past', () => {
    const status = deriveCaseStatus(
      { closedAt: null, confirmationRequestedAt: null, responseDeadlineDate: '2026-06-01T00:00:00.000Z' },
      now
    )
    expect(status).toBe('DEADLINE_APPROACHING')
  })

  it('returns IN_PROGRESS when nothing else applies and the deadline is comfortably out', () => {
    const status = deriveCaseStatus(
      { closedAt: null, confirmationRequestedAt: null, responseDeadlineDate: '2026-08-01T00:00:00.000Z' },
      now
    )
    expect(status).toBe('IN_PROGRESS')
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
