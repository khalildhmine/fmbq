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
    console.log('Comment API - No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Comment API - Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll accept any token for testing
  return { success: true, role: 'admin' }
}

// PUT handler to update a comment
export async function PUT(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log('Comment API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment API - Auth result:', authResult)

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

    // Get update data from request body
    const updateData = await req.json()

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No update data provided' },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()
    const collection = db.collection('videoComments')

    try {
      const commentId = new ObjectId(id)

      // Only allow updating certain fields
      const sanitizedUpdate = {}

      if (updateData.content !== undefined) sanitizedUpdate.content = updateData.content
      if (updateData.status !== undefined) sanitizedUpdate.status = updateData.status
      if (updateData.isAdminReply !== undefined)
        sanitizedUpdate.isAdminReply = !!updateData.isAdminReply

      sanitizedUpdate.updatedAt = new Date()

      const result = await collection.updateOne({ _id: commentId }, { $set: sanitizedUpdate })

      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 })
      }

      // Get the updated comment
      const updatedComment = await collection.findOne({ _id: commentId })

      return NextResponse.json({
        success: true,
        message: 'Comment updated successfully',
        comment: updatedComment,
      })
    } catch (error) {
      console.error('Invalid ObjectId format:', id)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in PUT /api/maison-adrar/video-comments/[id]:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE handler to delete a comment
export async function DELETE(req, { params }) {
  try {
    // Log the request headers for debugging
    console.log('Comment API - Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Comment API - Auth result:', authResult)

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

      // Delete the comment and all its replies
      const result = await collection.deleteMany({
        $or: [{ _id: commentId }, { parentId: commentId }],
      })

      if (result.deletedCount > 0) {
        return NextResponse.json({
          success: true,
          message: `Deleted comment and ${result.deletedCount - 1} replies`,
        })
      } else {
        return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Invalid ObjectId format:', id)
      return NextResponse.json(
        { success: false, message: 'Invalid comment ID format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in DELETE /api/maison-adrar/video-comments/[id]:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}
