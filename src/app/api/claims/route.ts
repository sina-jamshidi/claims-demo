import { NextRequest, NextResponse } from 'next/server'
import { getClaims, createClaim } from '@/lib/db'

export async function GET() {
  try {
    const claims = await getClaims()
    return NextResponse.json(claims)
  } catch (error) {
    console.error('Error in GET /api/claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimant_name, date, status, summary, details } = body

    if (!claimant_name || !date || !summary || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const claim = await createClaim({
      claimant_name,
      date,
      status: status || 'New',
      summary,
      details,
    })

    if (!claim) {
      return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
    }

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/claims:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}