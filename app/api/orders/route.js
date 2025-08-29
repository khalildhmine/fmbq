import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import User from '@/models/User'
import { verifyAuth } from '@/lib/auth'
import { sendOrderConfirmationNotification } from '@/utils/notifications'

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

    // Transform orders to ensure proper amount formatting
    const transformedOrders = orders.map(order => ({
      ...order,
      totalPrice: parseFloat(order.totalPrice || 0),
      cart: order.cart || order.products || [], // Ensure cart field exists
    }))

    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders,
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

// Only ONE POST export allowed!
export async function POST(request) {
  try {
    // Verify auth first
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    console.log('Received order data:', body)

    // Generate an order ID if not provided
    const orderId =
      body.orderId ||
      `ORD-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`

    // Create a new order with all the fields from the request
    const order = new Order({
      ...body,
      orderId,
      createdAt: new Date(),
      status: body.status || 'pending_verification',
      tracking: body.tracking || [
        {
          status: 'pending_verification',
          description: 'Awaiting payment verification',
          location: 'order.received',
          date: new Date().toISOString(),
        },
      ],
    })

    // Save the order to the database
    const savedOrder = await order.save()

    console.log('Order created:', savedOrder.orderId)

    // Send push notification to the user
    try {
      // Get the user's push tokens
      const user = await User.findById(body.user)
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        await sendOrderConfirmationNotification(user.pushTokens, savedOrder)
        console.log('Order confirmation notification sent to user')
      } else {
        console.log('No push tokens found for user, notification not sent')
      }
    } catch (notificationError) {
      // Don't fail the order creation if notification fails
      console.error('Error sending order notification:', notificationError)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: savedOrder._id,
          orderNumber: savedOrder.orderId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
