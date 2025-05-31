import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { connectToDatabase } from '@/helpers/db'
import { userRepo } from '@/helpers/db-repo/user-repo'

// Generate a unique email for mobile users
const generateUniqueEmail = mobile => {
  const cleanMobile = mobile.replace(/[^0-9]/g, '')
  const uuid = uuidv4().substring(0, 8)
  return `mobile_${cleanMobile}_${uuid}@mobileshop.com`
}

export async function POST(request) {
  try {
    console.log('[Mobile Register] Processing registration request')

    // Try to connect to the database with retries
    try {
      await connectToDatabase()
      console.log('[Mobile Register] Database connection established')
    } catch (dbError) {
      console.error('[Mobile Register] Database connection error:', dbError.message)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection error. Please try again later.',
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Parse request body
    const body = await request.json().catch(parseError => {
      console.error('[Mobile Register] Invalid request body:', parseError)
      return NextResponse.json(
        { status: 'error', message: 'Invalid request format' },
        { status: 400 }
      )
    })

    // Log the incoming request
    console.log('[Mobile Register] Registration attempt:', {
      name: body.name,
      mobile: body.mobile,
    })

    // Basic validation
    if (!body.name) {
      return NextResponse.json({ status: 'error', message: 'Name is required' }, { status: 400 })
    }

    if (!body.mobile) {
      return NextResponse.json(
        { status: 'error', message: 'Mobile number is required' },
        { status: 400 }
      )
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { status: 'error', message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Generate a unique email for this mobile user
    const uniqueEmail = generateUniqueEmail(body.mobile)

    // Create an object with all required fields from user input
    const userData = {
      name: body.name,
      email: uniqueEmail,
      password: body.password,
      mobile: body.mobile,
    }

    console.log('[Mobile Register] Creating user with data:', {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
    })

    try {
      // Create the user with the provided data
      const result = await userRepo.create(userData)

      // Return success response with user data and token
      return NextResponse.json(
        {
          status: 'success',
          data: {
            user: {
              _id: result.user._id,
              name: result.user.name,
              email: result.user.email,
              mobile: result.user.mobile,
              role: result.user.role || 'user',
            },
            token: result.token,
          },
          message: 'Registration successful',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[Mobile Register] User creation error:', error)

      // Handle specific case for user exists error
      if (error.name === 'UserExistsError') {
        return NextResponse.json(
          {
            status: 'error',
            message: error.message || 'User with this mobile number already exists',
          },
          { status: 409 }
        )
      }

      // Database connection errors
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Database connection error. Please try again later.',
          },
          { status: 503 } // Service Unavailable
        )
      }

      // Return a general error
      return NextResponse.json(
        {
          status: 'error',
          message: error.message || 'Registration failed. Please try again.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Mobile Register] Unhandled error:', error)

    // Return a server error response
    return NextResponse.json(
      {
        status: 'error',
        message: 'An unexpected error occurred during registration',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
