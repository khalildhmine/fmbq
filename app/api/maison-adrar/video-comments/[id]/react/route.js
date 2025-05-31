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
    console.log('Comment React API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Comment React API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll assume any valid token includes the user ID
  return {
    success: true,
    userId: '12345', // This would normally come from the decoded token
    role: 'user',
  }
}

// POST handler to react to a comment (like or dislike)
export async function POST(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log('Comment React API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment React API - Auth result:', authResult)

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

    // Get request body to determine reaction type
    const body = await req.json()
    const { type = 'like', action = 'add' } = body

    if (type !== 'like' && type !== 'dislike') {
      return NextResponse.json(
        { success: false, message: "Type must be either 'like' or 'dislike'" },
        { status: 400 }
      )
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { success: false, message: "Action must be either 'add' or 'remove'" },
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

      // Initialize likes and dislikes arrays if they don't exist
      if (!comment.likes) comment.likes = []
      if (!comment.dislikes) comment.dislikes = []

      // Determine the arrays to work with
      const targetArray = type === 'like' ? 'likes' : 'dislikes'
      const oppositeArray = type === 'like' ? 'dislikes' : 'likes'

      // Check if user already reacted with this type
      const alreadyReacted = comment[targetArray].includes(userId)

      if (action === 'add') {
        if (alreadyReacted) {
          return NextResponse.json(
            {
              success: false,
              message: `You have already ${type}d this comment`,
              [`${type}d`]: true,
              [`${type}Count`]: comment[targetArray].length,
              [`${type === 'like' ? 'dislike' : 'like'}Count`]: comment[oppositeArray].length,
            },
            { status: 400 }
          )
        }

        // Add the reaction and remove opposite reaction if exists
        const result = await collection.updateOne(
          { _id: commentId },
          {
            $addToSet: { [targetArray]: userId },
            $pull: { [oppositeArray]: userId }, // Remove from opposite array if present
          }
        )
      } else {
        // action === 'remove'
        if (!alreadyReacted) {
          return NextResponse.json(
            {
              success: false,
              message: `You have not ${type}d this comment`,
              [`${type}d`]: false,
              [`${type}Count`]: comment[targetArray].length,
              [`${type === 'like' ? 'dislike' : 'like'}Count`]: comment[oppositeArray].length,
            },
            { status: 400 }
          )
        }

        // Remove the reaction
        const result = await collection.updateOne(
          { _id: commentId },
          { $pull: { [targetArray]: userId } }
        )
      }

      // Get updated reaction counts
      const updatedComment = await collection.findOne({ _id: commentId })
      const likeCount = updatedComment.likes ? updatedComment.likes.length : 0
      const dislikeCount = updatedComment.dislikes ? updatedComment.dislikes.length : 0

      return NextResponse.json({
        success: true,
        message: `Comment ${action === 'add' ? `${type}d` : `un${type}d`} successfully`,
        liked: type === 'like' ? action === 'add' : updatedComment.likes.includes(userId),
        disliked: type === 'dislike' ? action === 'add' : updatedComment.dislikes.includes(userId),
        likeCount,
        dislikeCount,
      })
    } catch (error) {
      console.error('Invalid ObjectId format or other error:', id, error)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format or processing error' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/maison-adrar/video-comments/[id]/react:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// GET handler to check user reaction status for a comment
export async function GET(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log(
      'Comment React Status API - Request headers:',
      Object.fromEntries(req.headers.entries())
    )

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment React Status API - Auth result:', authResult)

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

      // Initialize arrays if they don't exist
      const likes = comment.likes || []
      const dislikes = comment.dislikes || []

      // Check user's reaction status
      const liked = likes.includes(userId)
      const disliked = dislikes.includes(userId)

      return NextResponse.json({
        success: true,
        liked,
        disliked,
        likeCount: likes.length,
        dislikeCount: dislikes.length,
      })
    } catch (error) {
      console.error('Invalid ObjectId format:', id)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in GET /api/maison-adrar/video-comments/[id]/react:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
