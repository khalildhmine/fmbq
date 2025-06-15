import { NextResponse } from 'next/server'
import Order from '@/models/Order'
import jwt from 'jsonwebtoken'
import { connectDb } from '@/lib/db'

// Helper function to extract token from request
function extractToken(req) {
  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const cookieHeader = req.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
    if (tokenCookie) {
      return tokenCookie.split('=')[1]
    }
  }

  return null
}

export async function GET(request) {
  try {
    // 1. Extract and verify token
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Verify token and check role
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      console.error('[Delivery Management] Token verification error:', error)
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    // 3. Connect to database
    try {
      await connectDb()
      console.log('[Delivery Management] Connected to database')
    } catch (dbError) {
      console.error('[Delivery Management] Database connection error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 503 }
      )
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status')

    // 5. Build query based on user role and status
    let query = {}

    // If user is not an admin, they can only see orders assigned to them
    if (!decoded.role?.includes('admin')) {
      query.assignedTo = decoded.id || decoded.sub
    }

    // Add status filter if provided
    if (status) {
      query.status = status
    }

    // 6. Calculate pagination
    const skip = (page - 1) * limit

    // 7. Fetch orders with proper population
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(decoded.role?.includes('admin') ? 0 : skip)
      .limit(decoded.role?.includes('admin') ? 0 : limit)
      .populate('user', 'name email mobile')
      .populate('assignedTo', 'name email')
      .lean()

    // 8. Get total count for pagination
    const total = await Order.countDocuments(query)

    // 9. Return response with pagination info
    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: decoded.role?.includes('admin') ? 1 : page,
          pageSize: decoded.role?.includes('admin') ? total : limit,
          totalPages: decoded.role?.includes('admin') ? 1 : Math.ceil(total / limit),
          hasNextPage: decoded.role?.includes('admin') ? false : skip + limit < total,
        },
      },
      role: decoded.role,
    })
  } catch (error) {
    console.error('[Delivery Management] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
