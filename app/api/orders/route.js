import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import { verifyAuth } from '@/lib/auth'

export async function GET(request) {
  let authResult

  try {
    // Verify auth first
    authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const pageSize =
      parseInt(url.searchParams.get('pageSize')) ||
      parseInt(url.searchParams.get('page_size')) ||
      10
    const isAdmin = url.searchParams.get('admin') === 'true'
    const since = url.searchParams.get('since')

    // Build query
    const query = {}

    // Apply user filter if not admin or not admin view
    if (!authResult.isAdmin || !isAdmin) {
      query.user = authResult.id
    }

    // Add since filter if provided
    if (since) {
      const sinceDate = new Date(parseInt(since))
      if (!isNaN(sinceDate)) {
        query.createdAt = { $gt: sinceDate }
      }
    }

    console.log('Executing orders query:', {
      query,
      page,
      pageSize,
      isAdmin,
      authResult: {
        isAdmin: authResult.isAdmin,
        id: authResult.id,
      },
    })

    // Execute query with pagination
    const skip = (page - 1) * pageSize
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments(query),
    ])

    console.log('Found orders:', orders.length)

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNextPage: skip + pageSize < total,
        },
      },
    })
  } catch (error) {
    console.error('Error in orders API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
