import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brokerName, brokerEmail, responseContent, tag, tier } = body

    if (!brokerName || !brokerEmail || !responseContent || !tag) {
      return NextResponse.json(
        { error: 'Missing required fields: brokerName, brokerEmail, responseContent, tag' },
        { status: 400 }
      )
    }

    const response = await prisma.brokerResponse.create({
      data: { brokerName, brokerEmail, responseContent, tag, tier: tier ?? null },
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ingest response' }, { status: 500 })
  }
}
