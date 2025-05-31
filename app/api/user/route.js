import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'
import jwt from 'jsonwebtoken'

async function verifyAuth(request) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    console.log('[Auth Debug] No token found in cookies')
    return { success: false, message: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )
    console.log('[Auth Debug] Decoded token:', decoded)

    // Verify admin role
    if (!decoded.role || decoded.role !== 'admin') {
      console.log('[Auth Debug] User is not admin:', decoded.role)
      return { success: false, message: 'Admin access required' }
    }

    return { success: true, user: decoded }
  } catch (error) {
    console.log('[Auth Debug] Token verification error:', error.message)
    return { success: false, message: error.message }
  }
}

export async function GET(request) {
  try {
    console.log('[API Debug] Received request for /api/user')
    const auth = await verifyAuth(request)

    if (!auth.success) {
      console.log('[API Debug] Auth failed:', auth.message)
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 })
    }

    console.log('[API Debug] Auth successful, connecting to database')
    await connectToDatabase()
    const users = await User.find().select('-password')
    console.log('[API Debug] Found users:', users.length)

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('[API Debug] GET users error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
