import { NextResponse } from 'next/server'
import { getAuthToken, verifyAuth } from '@/lib/server-auth'

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: authResult.id,
        email: authResult.email,
        role: authResult.role,
      },
    })
  } catch (error) {
    console.error('User auth error:', error)
    return NextResponse.json({ success: false, message: 'Auth error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
