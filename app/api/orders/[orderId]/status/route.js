import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import Order from '@/models/Order'
import { verifyAuth } from '@/utils/auth'
import { sendNotification } from '@/services/notifications.service'

export async function PATCH(request, context) {
  try {
    // Get orderId from context.params
    const orderId = context.params.orderId

    // Verify authentication first
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get the new status from request body
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 })
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
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Find the order and populate user data
    const order = await Order.findById(orderId).populate('user', 'expoPushToken email name')
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
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

    // Send notification to user if they have a notification token
    if (order.user?.expoPushToken) {
      try {
        console.log('Sending notification to token:', order.user.expoPushToken)
        await sendNotification({
          tokens: [order.user.expoPushToken],
          title: 'Order Status Update',
          body: `Your order #${order.orderNumber || orderId} has been ${status}`,
          data: {
            type: 'ORDER_STATUS',
            orderId: orderId,
            status: status,
            orderNumber: order.orderNumber,
          },
        })
        console.log('Notification sent successfully')
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the request if notification fails
      }
    } else {
      console.log('No push token found for user:', order.user?._id)
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update order status' },
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

    const order = await Order.findById(orderId).populate('user', 'expoPushToken email name')
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

    // Send notification
    if (order.user?.expoPushToken) {
      try {
        console.log('Sending notification to token:', order.user.expoPushToken)
        await sendNotification({
          tokens: [order.user.expoPushToken],
          title: 'Order Status Update',
          body: `Your order #${order.orderNumber || orderId} has been ${status}`,
          data: {
            type: 'ORDER_STATUS',
            orderId: orderId,
            status: status,
            orderNumber: order.orderNumber,
          },
        })
        console.log('Notification sent successfully')
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
      }
    } else {
      console.log('No push token found for user:', order.user?._id)
    }

    return Response.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
