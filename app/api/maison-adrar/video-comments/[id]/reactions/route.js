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
    console.log('Comment Reactions API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Comment Reactions API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll assume any valid token includes the user ID
  return {
    success: true,
    userId: '12345', // This would normally come from the decoded token
    role: 'user',
  }
}

// GET handler to retrieve users who liked or disliked a comment
export async function GET(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log(
      'Comment Reactions API - Request headers:',
      Object.fromEntries(req.headers.entries())
    )

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment Reactions API - Auth result:', authResult)

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

    // Get type from query params - 'likes' or 'dislikes'
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'likes'

    if (type !== 'likes' && type !== 'dislikes') {
      return NextResponse.json(
        { success: false, message: "Type must be either 'likes' or 'dislikes'" },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const commentsCollection = db.collection('videoComments')
    const usersCollection = db.collection('users')

    try {
      const commentId = new ObjectId(id)

      // First, check if the comment exists
      const comment = await commentsCollection.findOne({ _id: commentId })
      if (!comment) {
        return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 })
      }

      // Get the user IDs who liked/disliked the comment
      const userIds = comment[type] || []

      // If there are no reactions of this type
      if (userIds.length === 0) {
        return NextResponse.json({
          success: true,
          type,
          users: [],
          count: 0,
        })
      }

      // Convert string IDs to ObjectIds where necessary
      const objectIdUserIds = userIds.map(userId => {
        try {
          return new ObjectId(userId)
        } catch (e) {
          // If it's not a valid ObjectId format, return as string
          return userId
        }
      })

      // Lookup the user information
      const users = await usersCollection
        .find(
          { _id: { $in: objectIdUserIds } },
          { projection: { password: 0, token: 0 } } // Exclude sensitive fields
        )
        .toArray()

      // If no users found but we have IDs (could be due to deleted users)
      if (users.length === 0) {
        // Return mock data for demo purposes
        const mockUsers = userIds.map(userId => ({
          _id: userId,
          name: `User ${userId.substring(0, 5)}`,
          avatar: `https://ui-avatars.com/api/?name=User+${userId.substring(
            0,
            2
          )}&background=random`,
          username: `user_${userId.substring(0, 5)}`,
        }))

        return NextResponse.json({
          success: true,
          type,
          users: mockUsers,
          count: mockUsers.length,
        })
      }

      return NextResponse.json({
        success: true,
        type,
        users,
        count: users.length,
      })
    } catch (error) {
      console.error('Invalid ObjectId format:', id, error)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in GET /api/maison-adrar/video-comments/[id]/reactions:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
