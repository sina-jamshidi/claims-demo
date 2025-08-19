import { NextRequest, NextResponse } from 'next/server'
import { getAdmins, createAdmin } from '@/lib/db'

export async function GET() {
  try {
    const admins = await getAdmins()
    return NextResponse.json(admins)
  } catch (error) {
    console.error('Error in GET /api/admins:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role } = body

    if (!name?.trim() || !email?.trim() || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['admin', 'super-admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const admin = await createAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
    })

    if (!admin) {
      return NextResponse.json({ error: 'Failed to create admin (email may already exist)' }, { status: 500 })
    }

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admins:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}