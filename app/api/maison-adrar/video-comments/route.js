import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

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
    console.log('Comments API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Comments API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll accept any token for testing
  return { success: true, role: 'admin' }
}

// GET handler to fetch comments
export async function GET(req) {
  try {
    // Log the request headers for debugging
    console.log('Comments API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comments API - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message, redirectUrl: authResult.redirectUrl },
        { status: 401 }
      )
    }

    // Connect to database
    console.log('Connecting to MongoDB...')
    const { db } = await connectToDatabase()
    const collection = db.collection('videocomments')

    // Parse query parameters
    const url = new URL(req.url)
    const videoId = url.searchParams.get('videoId')

    // Build query
    const query = { parentId: null } // Only get top-level comments (not replies)
    if (videoId) {
      query.videoId = videoId
    }

    // Fetch comments with their replies
    const comments = await collection.find(query).sort({ createdAt: -1 }).toArray()

    // For each comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async comment => {
        const replies = await collection
          .find({ parentId: comment._id.toString() })
          .sort({ createdAt: 1 })
          .toArray()

        return {
          ...comment,
          replies: replies || [],
        }
      })
    )

    console.log(
      `Found ${comments.length} comments with ${commentsWithReplies.reduce(
        (sum, c) => sum + (c.replies?.length || 0),
        0
      )} replies`
    )

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
    })
  } catch (error) {
    console.error('Error in GET /api/maison-adrar/video-comments:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST handler to create a new comment
export async function POST(req) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comments API POST - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message, redirectUrl: authResult.redirectUrl },
        { status: 401 }
      )
    }

    // Get request body
    const commentData = await req.json()

    // Validate required fields
    if (!commentData.content || !commentData.videoId || !commentData.userId) {
      return NextResponse.json(
        { success: false, message: 'Content, videoId and userId are required' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const collection = db.collection('videoComments')

    // Add metadata
    commentData.createdAt = new Date()
    commentData.updatedAt = new Date()
    commentData.likes = 0

    // Insert document
    const result = await collection.insertOne(commentData)

    return NextResponse.json({
      success: true,
      comment: { _id: result.insertedId, ...commentData },
    })
  } catch (error) {
    console.error('Error in POST /api/maison-adrar/video-comments:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
