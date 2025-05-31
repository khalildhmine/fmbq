import { userRepo } from '@/helpers/db-repo/user-repo'
import { setJson } from '@/helpers/api'
import { connectToDatabase } from '@/helpers/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  console.log('[Mobile Login API] Processing mobile login request')

  try {
    // Ensure database connection
    try {
      await connectToDatabase()
      console.log('[Mobile Login API] Database connection established')
    } catch (dbError) {
      console.error('[Mobile Login API] Database connection error:', dbError.message)
      return setJson(
        {
          status: 'error',
          message: 'Database connection error. Please try again later.',
        },
        503 // Service Unavailable
      )
    }

    // Parse request body
    const body = await req.json().catch(error => {
      console.error('[Mobile Login API] Failed to parse request body:', error)
      throw new Error('Invalid request format')
    })

    const { mobile, password, otp, email } = body

    console.log('[Mobile Login API] Login attempt:', {
      mobile,
      email,
      hasPassword: !!password,
      hasOtp: !!otp,
    })

    if (!mobile) {
      console.error('[Mobile Login API] Missing mobile number')
      return setJson(
        {
          status: 'error',
          message: 'Mobile number is required',
        },
        400
      )
    }

    // Check which authentication method to use
    if (!password && !otp) {
      console.error('[Mobile Login API] Missing credentials')
      return setJson(
        {
          status: 'error',
          message: 'Password or OTP is required',
        },
        400
      )
    }

    // Verify userRepo is available
    if (!userRepo || typeof userRepo.getOne !== 'function') {
      console.error('[Mobile Login API] userRepo or getOne method not available')
      return setJson(
        {
          status: 'error',
          message: 'Authentication service unavailable',
        },
        500
      )
    }

    // Find user by mobile number
    try {
      var user = await userRepo.getOne({ mobile: mobile })
    } catch (dbError) {
      console.error('[Mobile Login API] Database lookup error:', dbError.message)
      return setJson(
        {
          status: 'error',
          message: 'Authentication service temporarily unavailable',
        },
        503 // Service Unavailable
      )
    }

    if (!user) {
      console.error('[Mobile Login API] User not found with mobile:', mobile)
      return setJson(
        {
          status: 'error',
          message: 'No account found with this mobile number',
        },
        401
      )
    }

    // Password-based authentication
    if (password) {
      // We'll use the authenticate method with the email from the user record
      try {
        const authenticatedUser = await userRepo.authenticate(user.email, password)

        if (!authenticatedUser) {
          console.error('[Mobile Login API] Password authentication failed for mobile:', mobile)
          return setJson(
            {
              status: 'error',
              message: 'Invalid password',
            },
            401
          )
        }

        return generateSuccessResponse(authenticatedUser)
      } catch (error) {
        console.error('[Mobile Login API] Authentication error:', error)

        // Check if it's a database error
        if (error.message.includes('database') || error.message.includes('connection')) {
          return setJson(
            {
              status: 'error',
              message: 'Authentication service temporarily unavailable',
            },
            503 // Service Unavailable
          )
        }

        return setJson(
          {
            status: 'error',
            message: 'Invalid password',
          },
          401
        )
      }
    }

    // OTP-based authentication (simplified for now)
    if (otp) {
      // In a real implementation, we would verify the OTP against a stored value
      // For now, we'll use a test OTP value of "123456" for development
      if (otp === '123456') {
        return generateSuccessResponse(user)
      } else {
        console.error('[Mobile Login API] Invalid OTP for mobile:', mobile)
        return setJson(
          {
            status: 'error',
            message: 'Invalid verification code',
          },
          401
        )
      }
    }

    // This should not happen due to earlier validation
    return setJson(
      {
        status: 'error',
        message: 'Invalid login method',
      },
      400
    )
  } catch (error) {
    console.error('[Mobile Login API] Unhandled error:', error)

    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return setJson(
        {
          status: 'error',
          message: 'Service temporarily unavailable. Please try again later.',
        },
        503 // Service Unavailable
      )
    }

    return setJson(
      {
        status: 'error',
        message: error.message || 'Authentication failed',
      },
      401
    )
  }
}

// Helper function to generate a successful login response
function generateSuccessResponse(user) {
  console.log('[Mobile Login API] Authentication successful for mobile:', user.mobile)

  // Create a safe user object without sensitive data
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role || 'user',
    avatar: user.avatar,
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
    },
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  )

  // Return success response with token
  return setJson(
    {
      status: 'success',
      message: 'Login successful',
      data: {
        user: safeUser,
        token,
      },
    },
    200
  )
}
