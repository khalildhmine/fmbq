import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import MaisonAdrarVideo from '@/models/MaisonAdrarVideo'

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const featured = searchParams.get('featured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Connect to database first to ensure connection is established
    await connectToDatabase()
    console.log('Connected to database for video fetch')

    // Calculate pagination values
    const skip = (page - 1) * limit

    // Build filter object
    const filter = {}

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { perfumeName: { $regex: search, $options: 'i' } },
      ]
    }

    if (type) {
      filter.type = type
    }

    if (searchParams.has('featured')) {
      filter.featured = featured
    }

    // Filter for published videos only
    filter.status = 'published'

    // Fetch videos from the database
    const videos = await MaisonAdrarVideo.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)

    const total = await MaisonAdrarVideo.countDocuments(filter)

    console.log('Video filter:', JSON.stringify(filter))
    console.log('Sort options:', `${sortBy} ${sortOrder}`)
    console.log(`Found ${total} videos matching criteria`)
    console.log(`Returning ${videos.length} videos for page ${page}`)

    // Log the response being sent to the frontend
    console.log('Response:', {
      success: true,
      data: { videos, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    })

    return NextResponse.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch videos' }, { status: 500 })
  }
}
