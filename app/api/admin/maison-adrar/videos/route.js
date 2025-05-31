import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectDb } from '@/lib/db'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'
import MaisonAdrar from '@/models/MaisonAdrar'

// Helper function to extract token from various sources
function extractToken(req) {
  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const cookies = req.cookies
  if (cookies.get('token')) {
    return cookies.get('token').value
  }
  if (cookies.get('authToken')) {
    return cookies.get('authToken').value
  }

  // Check URL parameters (less secure, but sometimes needed)
  const url = new URL(req.url)
  const tokenParam = url.searchParams.get('token')
  if (tokenParam) {
    return tokenParam
  }

  return null
}

// Verify authentication
async function verifyAuth(req) {
  const token = extractToken(req)

  if (!token) {
    console.log('No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll accept any token for testing
  return { success: true, role: 'admin' }
}

// GET handler to fetch videos
export async function GET(req) {
  try {
    // Log the request headers for debugging
    console.log('Videos API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Videos API - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
          redirectUrl: authResult.redirectUrl,
        },
        {
          status: 401,
        }
      )
    }

    // Connect to database
    console.log('Connecting to MongoDB using Mongoose...')
    await connectDb()

    // Parse query parameters
    const url = new URL(req.url)
    const perfumeId = url.searchParams.get('perfumeId')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const featured = url.searchParams.get('featured') === 'true'

    // Build query
    const query = {}
    if (perfumeId) query.perfumeId = perfumeId
    if (type) query.type = type
    if (status) query.status = status
    if (url.searchParams.has('featured')) query.featured = featured

    try {
      // Fetch videos using Mongoose
      const videos = await MaisonAdrarVideo.find(query).sort({ createdAt: -1 }).lean()

      console.log(`Found ${videos.length} videos matching query`)

      // If perfumeId is provided, fetch the perfume details
      let perfume = null
      if (perfumeId) {
        try {
          perfume = await MaisonAdrar.findById(perfumeId).lean()
        } catch (err) {
          console.error('Error fetching perfume:', err)
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          videos,
          perfume,
        },
      })
    } catch (error) {
      console.error('Database error:', error.message)
      throw new Error(`Error querying database: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in GET /api/admin/maison-adrar/videos:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {
        status: 500,
      }
    )
  }
}

// POST handler to create a new video
export async function POST(req) {
  try {
    // Log the request headers for debugging
    console.log('Videos API POST - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Videos API POST - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
          redirectUrl: authResult.redirectUrl,
        },
        {
          status: 401,
        }
      )
    }

    // Parse request body
    const videoData = await req.json()

    // Validate required fields
    if (!videoData.title || !videoData.videoUrl || !videoData.thumbnailUrl) {
      return NextResponse.json(
        { success: false, message: 'Title, videoUrl, and thumbnailUrl are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDb()

    try {
      // If perfumeId is provided, validate it exists and get the name
      if (videoData.perfumeId) {
        try {
          const perfume = await MaisonAdrar.findById(videoData.perfumeId).lean()
          if (perfume) {
            videoData.perfumeName = perfume.name
          }
        } catch (err) {
          console.warn('Unable to validate perfumeId, continuing anyway')
        }
      }

      // Add default values
      videoData.views = videoData.views || 0
      videoData.likes = videoData.likes || 0

      // Create new video using Mongoose model
      const newVideo = new MaisonAdrarVideo(videoData)
      const savedVideo = await newVideo.save()

      return NextResponse.json({
        success: true,
        data: savedVideo.toObject(),
      })
    } catch (error) {
      console.error('Database error:', error.message)
      throw new Error(`Error inserting document: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in POST /api/admin/maison-adrar/videos:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {
        status: 500,
      }
    )
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
