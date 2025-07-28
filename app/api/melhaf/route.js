import { connectToDatabase } from '@/helpers/db'
import Melhaf from '@/models/melhaf'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(req) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    console.log('Search params:', searchParams.toString())

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const hasDiscount = searchParams.get('hasDiscount') === 'true'

    let query = {}

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Add type filter
    if (type) {
      query.type = type
    }

    // Add discount filter
    if (hasDiscount) {
      query['promotion.isActive'] = true
      query['promotion.discountValue'] = { $gt: 0 }
      query['promotion.endDate'] = { $gt: new Date() }
    }

    console.log('MongoDB query:', query)

    const [melhafs, total] = await Promise.all([
      Melhaf.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Melhaf.countDocuments(query),
    ])

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
      }
    )
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const data = await req.json()

    const melhaf = await Melhaf.create({
      ...data,
      createdBy: session.user.id
    })

    return NextResponse.json(
      { success: true, data: melhaf },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in melhaf creation:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create melhaf' },
      { status: 500 }
    )
  }
}
