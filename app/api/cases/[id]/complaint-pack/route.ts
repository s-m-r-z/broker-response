import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Pre-populated complaint draft fields, with jurisdiction/authority
// confirmation surfaced explicitly so the drafter can see whether either is
// still pending before filing.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kase = await prisma.case.findUnique({ where: { id } })
  if (!kase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    caseId: kase.id,
    brokerName: kase.brokerName,
    userLocation: { country: kase.userCountry, state: kase.userState },
    applicableRegime: kase.applicableRegime,
    filingAuthority: kase.filingAuthority,
    complaintUrl: kase.complaintUrl,
    maxFine: kase.maxFine,
    responseDeadlineDate: kase.responseDeadlineDate,
    jurisdictionConfirmed: kase.jurisdictionConfirmedAt !== null,
    authorityConfirmed: kase.authorityConfirmedAt !== null,
  })
}
