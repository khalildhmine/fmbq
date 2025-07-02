import { NextResponse } from 'next/server'
// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'
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

// GET handler to fetch a single video
export async function GET(req, { params }) {
  try {
    // Log request
    console.log(`Video Detail API - GET request for video ID: ${params.id}`)

    // Verify authentication
    const authResult = await verifyAuth(req)
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
    await connectToDatabase()

    // Fetch video
    const video = await MaisonAdrarVideo.findById(params.id).lean()

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          message: 'Video not found',
        },
        { status: 404 }
      )
    }

    // If video has perfumeId, fetch the perfume details
    if (video.perfumeId) {
      try {
        const perfume = await MaisonAdrar.findById(video.perfumeId).lean()
        video.perfumeDetails = perfume
      } catch (err) {
        console.error('Error fetching perfume:', err)
      }
    }

    return NextResponse.json({
      success: true,
      data: video,
    })
  } catch (error) {
    console.error(`Error in GET /api/admin/maison-adrar/videos/${params.id}:`, error)
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

// PUT handler to update a video
export async function PUT(req, { params }) {
  try {
    // Log request
    console.log(`Video Detail API - PUT request for video ID: ${params.id}`)

    // Verify authentication
    const authResult = await verifyAuth(req)
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
    const updateData = await req.json()

    // Connect to database
    await connectToDatabase()

    // Check if video exists
    const existingVideo = await MaisonAdrarVideo.findById(params.id)
    if (!existingVideo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Video not found',
        },
        { status: 404 }
      )
    }

    // Process tags if provided
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim())
    }

    // If perfumeId is provided and changed, update perfumeName
    if (updateData.perfumeId && String(existingVideo.perfumeId) !== String(updateData.perfumeId)) {
      try {
        const perfume = await MaisonAdrar.findById(updateData.perfumeId).lean()
        if (perfume) {
          updateData.perfumeName = perfume.name
        }
      } catch (err) {
        console.warn('Unable to validate perfumeId during update, continuing anyway')
      }
    }

    // Update video with timestamps
    updateData.updatedAt = new Date()

    // Using findByIdAndUpdate with { new: true } to return the updated document
    const updatedVideo = await MaisonAdrarVideo.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    return NextResponse.json({
      success: true,
      data: updatedVideo,
      message: 'Video updated successfully',
    })
  } catch (error) {
    console.error(`Error in PUT /api/admin/maison-adrar/videos/${params.id}:`, error)
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

// DELETE handler to remove a video
export async function DELETE(req, { params }) {
  try {
    // Log request
    console.log(`Video Detail API - DELETE request for video ID: ${params.id}`)

    // Verify authentication
    const authResult = await verifyAuth(req)
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
    await connectToDatabase()

    // Find and delete the video
    const deletedVideo = await MaisonAdrarVideo.findByIdAndDelete(params.id)

    if (!deletedVideo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Video not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    })
  } catch (error) {
    console.error(`Error in DELETE /api/admin/maison-adrar/videos/${params.id}:`, error)
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
