import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(req) {
  try {
    console.log('[Login Debug] Processing login request')

    if (!req.body) {
      return NextResponse.json(
        {
          success: false,
          message: 'No request body',
        },
        { status: 400 }
      )
    }

    const { email, password } = await req.json()
    console.log('[Login Debug] Login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      console.log('[Login Debug] User not found:', email)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('[Login Debug] Invalid password for:', email)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    console.log('[Login Debug] User authenticated:', {
      id: user._id,
      email: user.email,
      role: user.role,
    })

    // Create token with jose
    const secret = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )

    const token = await new SignJWT({ id: user._id.toString(), role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    console.log('[Login Debug] Generated token payload:', {
      id: user._id,
      role: user.role,
    })

    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set cookies in the response
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log('[Login Debug] Set cookies:', {
      token: 'JWT Token (hidden)',
      user_role: user.role,
    })

    return response
  } catch (error) {
    console.error('[Login Debug] Error:', error)
    return NextResponse.json({ success: false, message: 'Authentication failed' }, { status: 500 })
  }
}
