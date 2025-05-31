import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  console.log('🔑 getToken API route called')

  try {
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Get environment variables
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

    // Debug environment variables
    console.log('Environment variables availability:')
    console.log('- API Secret exists:', !!apiSecret)
    console.log('- Cloud Name:', cloudName || 'NOT SET')
    console.log('- API Key exists:', !!apiKey)

    if (!apiSecret) {
      console.error('Error: CLOUDINARY_API_SECRET is not defined in environment variables')
      return NextResponse.json(
        { success: false, message: 'Server configuration error: Missing Cloudinary API secret' },
        { status: 500 }
      )
    }

    if (!cloudName || !apiKey) {
      console.error('Error: Cloudinary configuration is incomplete')
      const missingVars = []
      if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
      if (!apiKey) missingVars.push('NEXT_PUBLIC_CLOUDINARY_API_KEY')

      return NextResponse.json(
        {
          success: false,
          message: `Server configuration error: Missing ${missingVars.join(', ')}`,
        },
        { status: 500 }
      )
    }

    // Create the exact string that Cloudinary expects
    const paramsToSign = `folder=products&timestamp=${timestamp}`

    // Generate signature using raw string
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    console.log('Params to sign:', paramsToSign)
    console.log('Generated signature:', signature)

    // Return the token data in a proper NextResponse
    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName,
        apiKey,
      },
    })
  } catch (error) {
    console.error('Error generating upload token:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate upload token' },
      { status: 500 }
    )
  }
}

// Force dynamic rendering to avoid caching
export const dynamic = 'force-dynamic'
