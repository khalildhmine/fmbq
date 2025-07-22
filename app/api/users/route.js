import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'

export async function GET(request) {
  try {
    await connectToDatabase()

    // Get URL parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '25')
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || '-createdAt'
    const role = url.searchParams.get('role') || ''

    // Build query
    const query = {}

    // Add search conditions if search term exists
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ]
    }

    // Add role filter if specified
    if (role) {
      query.role = role
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ])

    // Calculate total pages
    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.isVerified,
          notificationsEnabled: user.notificationsEnabled,
          avatar: user.avatar,
          address: user.address,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Include any additional fields needed by the frontend
          stats: {
            ordersCount: 0, // You might want to populate this from Orders collection
            totalSpent: 0, // You might want to calculate this from Orders
          },
        })),
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Indicate that this is a dynamic route
export const dynamic = 'force-dynamic'
