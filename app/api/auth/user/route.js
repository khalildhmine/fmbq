import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getAuthToken } from '@/lib/server-auth'

export async function GET(request) {
  try {
    // Get token from cookies
    const token = getAuthToken()
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    // Add token to request headers
    const headers = new Headers(request.headers)
    headers.set('authorization', `Bearer ${token}`)
    const requestWithAuth = new Request(request.url, {
      method: request.method,
      headers,
    })

    // Verify the token
    const authResult = await verifyAuth(requestWithAuth)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message || 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: authResult.user,
    })
  } catch (error) {
    console.error('Error in auth/user route:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
