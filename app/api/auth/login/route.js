import { NextResponse } from 'next/server'
import { createAccessToken } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    await connectToDatabase()

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const token = createAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    // Set up redirect based on role
    const redirectPath = user.role === 'admin' ? '/admin' : '/'
    console.log('Redirecting user to:', redirectPath, 'Role:', user.role)

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          isAdmin: user.role === 'admin',
        },
        token,
        redirectTo: redirectPath, // Explicitly include redirect path
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set('userRole', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
