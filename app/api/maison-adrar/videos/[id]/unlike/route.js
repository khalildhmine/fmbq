import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'
import VideoLike from '@/models/VideoLike'
import { isValidObjectId } from 'mongoose'

export async function POST(request, context) {
  try {
    const params = await context.params
    const id = params.id

    // Verify user authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
    const user = authResult.user

    // Parse request body to get userId (if provided in request body)
    const body = await request.json().catch(() => ({}))
    console.log('Request body for unlike:', body)

    // Use userId from body or fall back to authenticated user
    const userId = body.userId || user._id
    console.log('Using userId for unlike:', userId)

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID format' },
        { status: 400 }
      )
    }

    // Connect to DB
    await connectToDatabase()

    // Check if video exists
    const video = await MaisonAdrarVideo.findById(id)
    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    // Check if the user has liked this video
    const existingLike = await VideoLike.findOne({ videoId: id, userId })
    if (!existingLike) {
      // Count total likes
      const likes = await VideoLike.countDocuments({ videoId: id })
      return NextResponse.json(
        {
          success: false,
          message: 'You have not liked this video',
          data: { alreadyLiked: false, likes },
        },
        { status: 400 }
      )
    }

    // Remove the like
    await VideoLike.deleteOne({ _id: existingLike._id })

    // Count total likes after unlike
    const likes = await VideoLike.countDocuments({ videoId: id })

    // Update video.likes field
    video.likes = likes
    await video.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Video unliked successfully',
        data: { alreadyLiked: false, likes },
      },
      { status: 200 }
    )
  } catch (error) {
    // Show validation errors for debugging
    console.error('Error in unlike video API:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: error?.message,
        validation: error?.errors || undefined,
      },
      { status: 500 }
    )
  }
}
