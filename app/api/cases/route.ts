import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCaseSchema } from '@/lib/case-validation'
import { deriveCaseFields } from '@/lib/case-tracker'

export async function GET() {
  const cases = await prisma.case.findMany({ orderBy: { responseDeadlineDate: 'asc' } })
  return NextResponse.json(cases)
}

// Creates a case and derives applicableRegime/responseDeadlineDate/filingAuthority/
// complaintUrl/maxFine from userCountry+userState only. brokerCountry is stored for
// reference but never read by the derivation — see lib/case-tracker.ts.
export async function POST(req: NextRequest) {
  const parsed = createCaseSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const { userCountry, userState, brokerName, brokerCountry, removalRequestDate } = parsed.data

  const derived = deriveCaseFields({
    userCountry,
    userState,
    removalRequestDate: new Date(removalRequestDate),
  })

  if (!derived.mapped) {
    return NextResponse.json({ error: derived.warning }, { status: 422 })
  }

  const kase = await prisma.case.create({
    data: {
      userCountry,
      userState: userState ?? null,
      brokerName,
      brokerCountry,
      removalRequestDate: new Date(removalRequestDate),
      applicableRegime: derived.regime,
      responseDeadlineDate: derived.responseDeadlineDate,
      filingAuthority: derived.filingAuthority,
      complaintUrl: derived.complaintUrl,
      maxFine: derived.maxFine,
    },
  })

  return NextResponse.json(kase, { status: 201 })
}
