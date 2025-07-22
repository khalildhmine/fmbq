import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    console.log('[API Debug] Received request for /api/user')

    // Get token from cookies or authorization header
    const token =
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      console.log('[API Debug] No token found')
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
      console.log('[API Debug] Decoded token:', decoded)

      await connectToDatabase()

      // Parse query parameters
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page')) || 1
      const limit = parseInt(url.searchParams.get('limit')) || 25
      const search = url.searchParams.get('search') || ''
      const sort = url.searchParams.get('sort') || '-createdAt'
      const role = url.searchParams.get('role') || ''

      // If user ID is in token, fetch that specific user (for regular users)
      if (decoded.id && decoded.role !== 'admin') {
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: {
            users: [
              {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                avatar: user.avatar || '',
                hasPassword: !!user.password,
                isVerified: user.isVerified || false,
                coins: user.coins || 0,
              },
            ],
            total: 1,
          },
        })
      }

      // For admin users, return paginated users with search and filters
      if (decoded.role === 'admin') {
        // Build query
        const query = {}
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
          ]
        }
        if (role) {
          query.role = role
        }

        // Count total documents
        const total = await User.countDocuments(query)

        // Get users with pagination
        const users = await User.find(query)
          .select('-password')
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()

        // Transform users data
        const transformedUsers = users.map(user => ({
          _id: user._id,
          name: user.name || 'Unnamed User',
          email: user.email || 'No email',
          mobile: user.mobile || '',
          role: user.role || 'user',
          address: user.address || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          avatar: user.avatar || '',
          hasPassword: !!user.password,
          isVerified: user.isVerified || false,
          coins: user.coins || 0,
          stats: user.stats || { ordersCount: 0, totalSpent: 0 },
          notifications: user.notifications || { email: true, push: true },
          permissions: user.permissions || [],
          tags: user.tags || [],
          notes: user.notes || '',
        }))

        return NextResponse.json({
          success: true,
          data: {
            users: transformedUsers,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        })
      }

      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    } catch (error) {
      console.log('[API Debug] Token verification error:', error.message)
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
  } catch (error) {
    console.error('[API Debug] GET users error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
