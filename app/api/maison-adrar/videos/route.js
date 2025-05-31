import { NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
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

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Connect to database
    await connectDb()

    // Get total count for pagination
    const total = await MaisonAdrarVideo.countDocuments(filter)

    // Fetch videos with pagination, filtering and sorting
    const videos = await MaisonAdrarVideo.find(filter).sort(sort).skip(skip).limit(limit).lean()

    // Calculate pagination data
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching Maison Adrar videos:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos', error: error.message },
      { status: 500 }
    )
  }
}
