import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || ''

    // Build filter object
    const filter = {
      featured: true,
      status: 'published',
    }

    if (type) {
      filter.type = type
    }

    // Connect to database
    await connectToDatabase()

    // Fetch featured videos
    const videos = await MaisonAdrarVideo.find(filter).sort({ createdAt: -1 }).limit(limit).lean()

    // Increment view count for each video (asynchronously)
    videos.forEach(async video => {
      await MaisonAdrarVideo.findByIdAndUpdate(video._id, { $inc: { views: 1 } })
    })

    return NextResponse.json({
      success: true,
      data: videos,
    })
  } catch (error) {
    console.error('Error fetching featured Maison Adrar videos:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured videos', error: error.message },
      { status: 500 }
    )
  }
}
