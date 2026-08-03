import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ingestResponseSchema } from '@/lib/response-validation'
import { deriveCaseFields } from '@/lib/case-tracker'

export async function POST(req: NextRequest) {
  try {
    const parsed = ingestResponseSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Missing required fields: brokerName, brokerEmail, responseContent, tag', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      brokerName, brokerEmail, responseContent, tag, tier, website, jurisdiction, category,
      isHoldingReply, requiresCaseTracking, userCountry, userState, removalRequestDate, brokerCountry,
    } = parsed.data

    const response = await prisma.brokerResponse.create({
      data: {
        brokerName, brokerEmail, responseContent, tag,
        tier: tier ?? null,
        website: website ?? null,
        jurisdiction: jurisdiction ?? null,
        category: category ?? null,
        isHoldingReply: isHoldingReply ?? false,
      },
    })

    // Auto-create a linked enforcement case (US-10) when the classifier
    // flagged this as case-worthy and supplied the requester's own location
    // — mirrors POST /api/cases, but skips silently (rather than failing the
    // ingest) if the jurisdiction can't be resolved or fields are missing,
    // since the response itself should still be ingested either way.
    let kase = null
    let caseWarning: string | null = null
    if (requiresCaseTracking && userCountry && removalRequestDate) {
      const derived = deriveCaseFields({
        userCountry,
        userState,
        removalRequestDate: new Date(removalRequestDate),
      })
      if (derived.mapped) {
        const [createdCase] = await prisma.$transaction([
          prisma.case.create({
            data: {
              userCountry,
              userState: userState ?? null,
              brokerName,
              brokerCountry: brokerCountry ?? 'Unknown',
              removalRequestDate: new Date(removalRequestDate),
              applicableRegime: derived.regime,
              responseDeadlineDate: derived.responseDeadlineDate,
              filingAuthority: derived.filingAuthority,
              complaintUrl: derived.complaintUrl,
              maxFine: derived.maxFine,
              sourceResponseId: response.id,
            },
          }),
        ])
        await prisma.caseActionLog.create({ data: { caseId: createdCase.id, type: 'AUTO_CREATED' } })
        kase = createdCase
      } else {
        caseWarning = derived.warning
      }
    }

    return NextResponse.json({ ...response, case: kase, caseWarning }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ingest response' }, { status: 500 })
  }
}
