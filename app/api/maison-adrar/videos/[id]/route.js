import { NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import { isValidObjectId } from 'mongoose'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'
import MaisonAdrar from '@/models/MaisonAdrar'

// GET handler to fetch a single video and track views
export async function GET(request, { params }) {
  try {
    const { id } = params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid video ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDb()

    // Fetch video
    const video = await MaisonAdrarVideo.findById(id)

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 })
    }

    // Increment view count asynchronously
    await MaisonAdrarVideo.findByIdAndUpdate(id, { $inc: { views: 1 } })

    // If video has perfumeId, fetch the perfume details
    let perfumeDetails = null
    if (video.perfumeId) {
      try {
        perfumeDetails = await MaisonAdrar.findById(video.perfumeId).lean()
      } catch (err) {
        console.error('Error fetching perfume details:', err)
      }
    }

    // Convert to plain object
    const videoData = video.toObject ? video.toObject() : { ...video }

    // Add perfume details if available
    if (perfumeDetails) {
      videoData.perfumeDetails = perfumeDetails
    }

    return NextResponse.json({
      success: true,
      data: videoData,
    })
  } catch (error) {
    console.error(`Error fetching video with ID ${params.id}:`, error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video', error: error.message },
      { status: 500 }
    )
  }
}
