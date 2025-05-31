import { userRepo } from '@/helpers/db-repo/user-repo'
import { setJson } from '@/helpers/api'
import { connectToDatabase } from '@/helpers/db'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  console.log('[Send OTP] Processing OTP request')

  try {
    // Ensure database connection
    try {
      await connectToDatabase()
      console.log('[Send OTP] Database connection established')
    } catch (dbError) {
      console.error('[Send OTP] Database connection error:', dbError.message)
      return setJson(
        {
          status: 'error',
          message: 'Service temporarily unavailable. Please try again later.',
        },
        503 // Service Unavailable
      )
    }

    // Parse request body
    const body = await req.json().catch(error => {
      console.error('[Send OTP] Failed to parse request body:', error)
      throw new Error('Invalid request format')
    })

    const { mobile } = body

    if (!mobile) {
      console.error('[Send OTP] Missing mobile number')
      return setJson(
        {
          status: 'error',
          message: 'Mobile number is required',
        },
        400
      )
    }

    console.log('[Send OTP] Sending OTP to mobile:', mobile)

    // In a real implementation, we would:
    // 1. Generate a random OTP code
    // 2. Store it in the database with an expiry time
    // 3. Send it via SMS API

    // For development purposes, we'll just return success
    // The OTP code is hardcoded to 123456 in the login-mobile API

    // Check if the user exists first
    try {
      const user = await userRepo.getOne({ mobile: mobile })

      if (!user) {
        // We don't want to reveal if a user exists or not for security reasons
        // So we'll still return success even if the user doesn't exist
        console.log('[Send OTP] User not found for mobile:', mobile)
      } else {
        console.log('[Send OTP] User found for mobile:', mobile)
      }
    } catch (dbError) {
      // Even if the database lookup fails, we'll still return success
      // The user can try to use the OTP, but it will fail at the login step
      // if there's still a database issue
      console.error('[Send OTP] Database lookup error:', dbError.message)
    }

    // Simulate delay for sending SMS
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return success response
    return setJson(
      {
        success: true,
        message: 'OTP sent successfully',
      },
      200
    )
  } catch (error) {
    console.error('[Send OTP] Error:', error)

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
        message: error.message || 'Failed to send OTP',
      },
      500
    )
  }
}
