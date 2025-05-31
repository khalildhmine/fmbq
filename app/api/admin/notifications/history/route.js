import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Notification from '@/models/Notification'
import { verifyToken } from '@/helpers/jwt'

// Helper to get token from request
const getTokenFromRequest = req => {
  // First check Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }

  // Then check cookies
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

export async function GET(req) {
  try {
    // Get token from either Authorization header or cookies
    const token = getTokenFromRequest(req)
    if (!token) {
      console.log('No token found in request')
      return NextResponse.json(
        { status: 'error', message: 'Authorization required' },
        { status: 401 }
      )
    }

    // Verify token and check admin status
    let decodedToken
    try {
      decodedToken = await verifyToken(token)
      if (!decodedToken || !decodedToken.role || decodedToken.role !== 'admin') {
        console.log('User is not an admin:', decodedToken)
        return NextResponse.json(
          { status: 'error', message: 'Admin access required' },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json(
        { status: 'error', message: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()

    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 20
    const status = url.searchParams.get('status')

    // Build query
    const query = {}
    if (status) {
      query.status = status
    }

    // Get total count
    const total = await Notification.countDocuments(query)

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      status: 'success',
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch notification history' },
      { status: 500 }
    )
  }
}
