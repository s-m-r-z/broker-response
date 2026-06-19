import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://email-classifier.purewl.com/stats', {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 502 })
  }
}
