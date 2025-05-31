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
    console.log('Reply API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Reply API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll accept any token for testing
  return { success: true, role: 'admin' }
}

// POST handler to create a reply
export async function POST(req) {
  try {
    // Log the request headers for debugging
    console.log('Reply API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Reply API - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message, redirectUrl: authResult.redirectUrl },
        { status: 401 }
      )
    }

    // Get request body
    const replyData = await req.json()

    // Validate required fields
    if (!replyData.content || !replyData.parentId || !replyData.userId) {
      return NextResponse.json(
        { success: false, message: 'Content, parentId and userId are required' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const collection = db.collection('videoComments')

    // Verify the parent comment exists
    try {
      const parentId = new ObjectId(replyData.parentId)
      const parentComment = await collection.findOne({ _id: parentId })

      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: 'Parent comment not found' },
          { status: 404 }
        )
      }

      // Make sure we have the videoId from the parent comment
      if (!replyData.videoId && parentComment.videoId) {
        replyData.videoId = parentComment.videoId
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid parent comment ID format' },
        { status: 400 }
      )
    }

    // Add metadata
    replyData.createdAt = new Date()
    replyData.updatedAt = new Date()
    replyData.likes = 0

    // If it's an admin reply, set the flag
    if (replyData.isAdminReply) {
      replyData.isAdminReply = true
    }

    // Insert document
    const result = await collection.insertOne(replyData)

    return NextResponse.json({
      success: true,
      reply: { _id: result.insertedId, ...replyData },
    })
  } catch (error) {
    console.error('Error in POST /api/maison-adrar/video-comments/reply:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
