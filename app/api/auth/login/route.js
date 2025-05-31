import { NextResponse } from 'next/server'
import { createAccessToken } from '@/lib/auth'
import { connectDb } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      )
    }

    // Connect to database
    try {
      await connectDb()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      )
    }

    // Find user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    // Create token
    const token = createAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    // Create the response with headers
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
          },
          redirectTo: user.role === 'admin' ? '/admin' : '/',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // Set cookies with proper options
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    response.cookies.set('userRole', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in login route:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
