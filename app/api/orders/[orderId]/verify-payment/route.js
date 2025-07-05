import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import { verifyAuth } from '@/utils/auth'
import { sendNotification } from '@/services/notifications.service'

export async function POST(request, context) {
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

    // Get verification status from request body
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Verification status is required' },
        { status: 400 }
      )
    }

    // Valid verification statuses
    const validStatuses = ['pending', 'verified', 'rejected']
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

    // Create timeline event
    const timelineEvent = {
      type: 'payment_verification',
      content: `Payment ${status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending verification'}`,
      userId: authResult.user._id,
      createdAt: new Date(),
    }

    // Update order fields based on verification status
    const updateData = {
      paymentVerified: status === 'verified',
      paymentVerificationStatus: status,
      $push: { timeline: timelineEvent },
    }

    // If payment is verified, also update order status to processing
    if (status === 'verified') {
      updateData.status = 'processing'
      updateData.$push.timeline = [
        timelineEvent,
        {
          type: 'status',
          content: 'Order status changed from pending to processing after payment verification',
          userId: authResult.user._id,
          createdAt: new Date(),
        },
      ]
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })

    // Send notification to user if they have a notification token
    if (order.user?.expoPushToken) {
      try {
        console.log('Sending notification to token:', order.user.expoPushToken)
        await sendNotification({
          tokens: [order.user.expoPushToken],
          title: 'Payment Verification Update',
          body: `Your payment for order #${order.orderNumber || orderId} has been ${status}`,
          data: {
            type: 'PAYMENT_VERIFICATION',
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
      message: `Payment ${status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending verification'}`,
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating payment verification:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update payment verification' },
      { status: 500 }
    )
  }
}
