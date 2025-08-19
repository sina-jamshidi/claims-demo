import { NextRequest, NextResponse } from 'next/server'
import { getClaimNotes, createClaimNote } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notes = await getClaimNotes(params.id)
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error in GET /api/claims/[id]/notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { author_id, note } = body

    if (!author_id || !note?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newNote = await createClaimNote({
      claim_id: params.id,
      author_id,
      note: note.trim(),
    })

    if (!newNote) {
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/claims/[id]/notes:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}