import { NextRequest, NextResponse } from 'next/server'
import { getClaimById, updateClaimStatus } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claim = await getClaimById(params.id)
    
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json(claim)
  } catch (error) {
    console.error('Error in GET /api/claims/[id]:', error)
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !['New', 'In Review', 'Closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const success = await updateClaimStatus(params.id, status)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/claims/[id]:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}