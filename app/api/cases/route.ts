import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCaseSchema } from '@/lib/case-validation'
import { deriveCaseFields } from '@/lib/case-tracker'

// sourceResponseId filters to cases tracked from a specific broker response —
// used by response-detail.tsx to check whether a case already exists before
// offering "Track as Case" again.
//
// jurisdictionCountry (+ optional jurisdictionState) instead surfaces the
// three closest prior cases in the same jurisdiction (US-02) — used by
// new-case-dialog.tsx while filling out intake and by case-detail.tsx's
// RelatedCasesPanel. excludeId drops the current case out of its own match
// list. Matching is done in JS (not a DB query) to stay consistent with
// matchesJurisdiction in lib/jurisdiction-map.ts, which does the same loose,
// case-insensitive comparison for law regimes.
export async function GET(req: NextRequest) {
  const sourceResponseId = req.nextUrl.searchParams.get('sourceResponseId')
  const jurisdictionCountry = req.nextUrl.searchParams.get('jurisdictionCountry')
  const jurisdictionState = req.nextUrl.searchParams.get('jurisdictionState')
  const excludeId = req.nextUrl.searchParams.get('excludeId')

  if (jurisdictionCountry) {
    const country = jurisdictionCountry.trim().toLowerCase()
    const state = jurisdictionState?.trim().toLowerCase() || null

    const candidates = await prisma.case.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { actionLogs: { orderBy: { createdAt: 'desc' } } },
    })

    const matches = candidates
      .filter((c) => {
        const cCountry = c.userCountry.trim().toLowerCase()
        const cState = c.userState?.trim().toLowerCase() || null
        return cCountry === country && (!state || !cState || state === cState)
      })
      .slice(0, 3)

    return NextResponse.json(matches)
  }

  const cases = await prisma.case.findMany({
    where: sourceResponseId ? { sourceResponseId } : undefined,
    orderBy: { responseDeadlineDate: 'asc' },
    include: { actionLogs: { orderBy: { createdAt: 'desc' } } },
  })
  return NextResponse.json(cases)
}

// Creates a case and derives applicableRegime/responseDeadlineDate/filingAuthority/
// complaintUrl/maxFine from userCountry+userState only. brokerCountry is stored for
// reference but never read by the derivation — see lib/case-tracker.ts.
// sourceResponseId is an optional plain reference (not a Prisma relation) back
// to the BrokerResponse this case was tracked from, when created via "Track as
// Case" — see CLAUDE.md.
export async function POST(req: NextRequest) {
  const parsed = createCaseSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
  }

  const { userCountry, userState, brokerName, brokerCountry, removalRequestDate, sourceResponseId } = parsed.data

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
      sourceResponseId: sourceResponseId ?? null,
    },
    include: { actionLogs: true },
  })

  return NextResponse.json(kase, { status: 201 })
}
