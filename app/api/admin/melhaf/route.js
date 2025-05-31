import { connectToDatabase } from '@/helpers/db'
import Melhaf from '@/models/melhaf'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Helper function to verify token
const verifyToken = async request => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  // Add your token verification logic here
  return true
}

export async function POST(req) {
  try {
    // Get auth token from cookies using await
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get melhaf data from request
    const data = await req.json()

    // Create new melhaf
    const melhaf = new Melhaf(data)
    await melhaf.save()

    return NextResponse.json({
      success: true,
      message: 'Melhaf created successfully',
      data: melhaf,
    })
  } catch (error) {
    console.error('Create melhaf error:', error)
    return NextResponse.json(
      { message: error.message || 'Error creating melhaf' },
      { status: error.status || 500 }
    )
  }
}

export async function GET(req) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    console.log('Search params:', searchParams.toString())

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    let query = {}

    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }

    if (type) {
      query.type = type
    }

    console.log('MongoDB query:', query)

    const melhafs = await Melhaf.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Melhaf.countDocuments(query)

    console.log(`Found ${melhafs.length} melhafs`)

    return NextResponse.json({
      success: true,
      data: {
        melhafs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch melhafs',
        error: error.message,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
