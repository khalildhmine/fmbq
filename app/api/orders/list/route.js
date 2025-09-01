import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Order } from '@/models'
import { getAuthToken } from '@/lib/server-auth' // Correct import for getAuthToken
import jwt from 'jsonwebtoken' // Import jwt
import { cookies } from 'next/headers'

export async function GET(req) {
  try {
    console.log('Order list API: Starting request processing')

    const cookieStore = cookies() // Get cookie store
    const token = await getAuthToken(req, cookieStore) // Get token from request

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 })
    }

    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.id
    } catch (tokenError) {
      console.error('Order list API: Token verification failed:', tokenError)
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    console.log(`Order list API: Authenticated user ID: ${userId}`)

    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const page_size = parseInt(url.searchParams.get('page_size') || '10')

    console.log(`Order list API: Query params - page: ${page}, page_size: ${page_size}`)

    // Connect to database
    await connect()
    console.log('Order list API: Connected to database')

    // Get orders with pagination, filtered by user
    const orders = await Order.find({ user: userId }) // Filter by user ID
      .populate('user', '-password')
      .skip((page - 1) * page_size)
      .limit(page_size)
      .sort({
        createdAt: 'desc',
      })

    // Count total orders for pagination, filtered by user
    const ordersLength = await Order.countDocuments({ user: userId }) // Count filtered orders

    console.log(
      `Order list API: Found ${orders.length} orders out of ${ordersLength} total for user ${userId}`
    )

    console.log(
      'Order list API: Orders data before response:',
      orders.map(o => ({ _id: o._id, orderId: o.orderId }))
    ) // Add this line for debugging

    // Prepare response
    const result = {
      orders,
      ordersLength,
      pagination: {
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: page_size * page < ordersLength,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(ordersLength / page_size),
      },
    }

    // Return the response
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    console.error('Order list API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get orders',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
