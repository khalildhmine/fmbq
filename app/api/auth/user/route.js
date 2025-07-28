import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/server-auth'

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
      })
    }

    return new Response(JSON.stringify({ success: true, user: authResult.user }), { status: 200 })
  } catch (error) {
    console.error('Error verifying auth:', error)
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

export const dynamic = 'force-dynamic'
