import { NextResponse } from 'next/server'
import https from 'https'

const agent = new https.Agent({ rejectUnauthorized: false })

export async function GET() {
  try {
    const res = await fetch('https://email-classifier.purewl.com/stats', {
      // @ts-expect-error — node-fetch agent option for corporate SSL
      agent,
      next: { revalidate: 60 },
    })
    const data = await res.json()
    if (!data?.classifications) {
      return NextResponse.json({ error: 'Unexpected stats format' }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 502 })
  }
}
