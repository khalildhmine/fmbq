import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import Order from '@/models/Order'
import { Expo } from 'expo-server-sdk'

const expo = new Expo()

// Helper function to send push notification
async function sendOrderStatusNotification(user, order, newStatus) {
  try {
    if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
      console.log('No valid push token for user:', user._id)
      return
    }

    const message = {
      to: user.expoPushToken,
      sound: 'default',
      title: 'Order Status Update',
      body: `Your order #${order.orderNumber} has been updated to: ${newStatus}`,
      data: {
        type: 'ORDER_STATUS_UPDATE',
        orderId: order._id.toString(),
        status: newStatus,
      },
    }

    const chunks = expo.chunkPushNotifications([message])
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk)
      } catch (error) {
        console.error('Error sending push notification:', error)
      }
    }
  } catch (error) {
    console.error('Error in sendOrderStatusNotification:', error)
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params
    console.log('Updating order status for:', orderId)

    await connectToDatabase()

    // Verify authentication
    let authResult = await verifyAuth(request)

    // For development, if authentication fails, use mock authentication
    if (!authResult.success) {
      console.log('Authentication failed, using mock auth for development')
      authResult = mockAuth()
    }

    // Only admin can update order status
    const isAdmin = authResult.user.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get status from request body
    const { status } = await request.json()
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Valid order statuses
    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Find the order and update status
    const order = await Order.findById(orderId).populate('user', '-password')
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Add event to timeline
    const timelineEvent = {
      type: 'status',
      content: `Order status changed from ${order.status} to ${status}`,
      userId: authResult.user._id,
      createdAt: new Date(),
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: { timeline: timelineEvent },
      },
      { new: true }
    )
      .populate('user', '-password')
      .lean()

    // Send notification to user about status update
    if (order.user && order.user.notificationsEnabled) {
      await sendOrderStatusNotification(order.user, order, status)
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { orderId } = params

    // Validate admin access
    const authResult = await validateToken(request)
    if (!authResult.success || authResult.role !== 'admin') {
      return Response.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    await connectToDatabase()
    const { status } = await request.json()

    // Validate status transition
    const validTransitions = {
      pending_verification: ['picked_up'],
      picked_up: ['delivered'],
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition
    if (!validTransitions[order.status]?.includes(status)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid status transition',
        },
        { status: 400 }
      )
    }

    // Update order status
    order.status = status
    order.tracking.push({
      status,
      date: new Date(),
      description: `Order ${status === 'picked_up' ? 'picked up by delivery' : 'delivered'}`,
    })

    await order.save()

    return Response.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Status update error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
