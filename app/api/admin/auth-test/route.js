import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-replace-in-production'

export async function GET(request) {
  try {
    // Test authentication
    const authResult = await verifyAuth(request)

    // Log detailed authentication info
    console.log('Auth test endpoint accessed')
    console.log('Auth result:', JSON.stringify(authResult, null, 2))

    // Check request headers and cookies
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)

    const cookieStore = cookies()
    const tokenCookie = cookieStore.get('token')
    console.log('Token cookie:', tokenCookie ? 'Found' : 'Not found')

    // If there's no auth, create a temporary admin token for testing
    if (!authResult.authenticated) {
      const testToken = jwt.sign(
        { userId: 'test-admin', role: 'admin', email: 'admin@example.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      )

      // Return the token in the response
      return NextResponse.json({
        success: true,
        message: 'Authentication status',
        authResult,
        testToken,
        instructions: 'Use this token in the Authorization header: Bearer ' + testToken,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication status',
      authResult,
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { message: 'Error testing auth', error: error.message },
      { status: 500 }
    )
  }
}
