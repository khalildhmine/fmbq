import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
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
    console.log('Comment Like API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Comment Like API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll assume any valid token includes the user ID
  return {
    success: true,
    userId: '12345', // This would normally come from the decoded token
    role: 'user',
  }
}

// POST handler to like a comment
export async function POST(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log('Comment Like API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment Like API - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message, redirectUrl: authResult.redirectUrl },
        { status: 401 }
      )
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const collection = db.collection('videoComments')

    try {
      const commentId = new ObjectId(id)
      const userId = authResult.userId

      // First, check if the comment exists
      const comment = await collection.findOne({ _id: commentId })
      if (!comment) {
        return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 })
      }

      // Check if user already liked this comment
      if (comment.likes && comment.likes.includes(userId)) {
        return NextResponse.json(
          {
            success: false,
            message: 'You have already liked this comment',
            liked: true,
            likeCount: comment.likes.length,
          },
          { status: 400 }
        )
      }

      // Add user to likes array
      const result = await collection.updateOne(
        { _id: commentId },
        {
          $addToSet: { likes: userId },
          $pull: { dislikes: userId }, // Remove from dislikes if present
        }
      )

      // Get updated like count
      const updatedComment = await collection.findOne({ _id: commentId })
      const likeCount = updatedComment.likes ? updatedComment.likes.length : 0

      return NextResponse.json({
        success: true,
        message: 'Comment liked successfully',
        liked: true,
        likeCount: likeCount,
      })
    } catch (error) {
      console.error('Invalid ObjectId format:', id)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/maison-adrar/video-comments/[id]/like:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE handler to unlike a comment
export async function DELETE(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log('Comment Unlike API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment Unlike API - Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message, redirectUrl: authResult.redirectUrl },
        { status: 401 }
      )
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const collection = db.collection('videoComments')

    try {
      const commentId = new ObjectId(id)
      const userId = authResult.userId

      // Check if comment exists
      const comment = await collection.findOne({ _id: commentId })
      if (!comment) {
        return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 })
      }

      // Remove user from likes array
      const result = await collection.updateOne({ _id: commentId }, { $pull: { likes: userId } })

      // Get updated like count
      const updatedComment = await collection.findOne({ _id: commentId })
      const likeCount = updatedComment.likes ? updatedComment.likes.length : 0

      return NextResponse.json({
        success: true,
        message: 'Comment unliked successfully',
        liked: false,
        likeCount: likeCount,
      })
    } catch (error) {
      console.error('Invalid ObjectId format:', id)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in DELETE /api/maison-adrar/video-comments/[id]/like:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
