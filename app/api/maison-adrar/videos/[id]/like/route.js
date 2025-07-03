import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'
import VideoLike from '@/models/VideoLike'
import { isValidObjectId } from 'mongoose'

// POST endpoint to like a video (requires authentication)
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
    console.log('Request body for like:', body)

    // Use userId from body or fall back to authenticated user
    const userId = body.userId || user._id
    console.log('Using userId for like:', userId)

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

    // Check if already liked
    const existingLike = await VideoLike.findOne({ video: id, user: userId })
    if (existingLike) {
      // Count total likes
      const likes = await VideoLike.countDocuments({ video: id })
      return NextResponse.json(
        {
          success: false,
          message: 'You have already liked this video',
          data: { alreadyLiked: true, likes },
        },
        { status: 400 }
      )
    }

    // Fix: Use correct field names for VideoLike model (video, user)
    await VideoLike.create({ video: id, user: userId })

    // Count total likes after like
    const likes = await VideoLike.countDocuments({ video: id })

    // Optionally update video.likes field
    video.likes = likes
    await video.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Video liked successfully',
        data: { alreadyLiked: false, likes },
      },
      { status: 200 }
    )
  } catch (error) {
    // Show validation errors for debugging
    console.error('Error in like video API:', error)
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

// DELETE endpoint to unlike a video (requires authentication)
export async function DELETE(request, { params }) {
  try {
    // Verify user authentication
    const authResult = await verifyAuth(request)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const user = authResult.user

    // Get userId from URL params or fallback to authenticated user
    const url = new URL(request.url)
    const urlUserId = url.searchParams.get('userId')
    console.log('URL params for unlike:', Object.fromEntries(url.searchParams.entries()))

    // Use userId from URL params or fall back to authenticated user
    const userId = urlUserId || user._id
    console.log('Using userId for unlike:', userId)

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Check if video exists
    const video = await MaisonAdrarVideo.findById(id)
    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    // Check if the user has liked this video
    const existingLike = await VideoLike.findOne({ videoId: id, userId: userId })
    if (!existingLike) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have not liked this video',
          data: { likes: video.likes, alreadyLiked: false },
        },
        { status: 400 }
      )
    }

    // Remove the like record
    await VideoLike.deleteOne({ _id: existingLike._id })

    // Decrement the video's like count
    const updatedVideo = await MaisonAdrarVideo.findByIdAndUpdate(
      id,
      { $inc: { likes: -1 } },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Video unliked successfully',
      data: {
        likes: updatedVideo.likes,
        alreadyLiked: false,
      },
    })
  } catch (error) {
    console.error('Error unliking video:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to unlike video', error: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check if a user has liked a video
export async function GET(request, { params }) {
  try {
    const { id } = await params // Add await here

    // Verify user authentication
    const authResult = await verifyAuth(request)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = authResult.user

    // Get userId from URL params or fallback to authenticated user
    const url = new URL(request.url)
    const urlUserId = url.searchParams.get('userId')
    console.log('URL params for like status check:', Object.fromEntries(url.searchParams.entries()))

    // Use userId from URL params or fall back to authenticated user
    const userId = urlUserId || user._id
    console.log('Using userId for like status check:', userId)

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Check if video exists
    const video = await MaisonAdrarVideo.findById(id)
    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    // Check if the user has liked this video
    const existingLike = await VideoLike.findOne({ videoId: id, userId: userId })

    return NextResponse.json({
      success: true,
      data: {
        likes: video.likes,
        alreadyLiked: !!existingLike,
      },
    })
  } catch (error) {
    console.error('Error checking video like status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check like status', error: error.message },
      { status: 500 }
    )
  }
}
