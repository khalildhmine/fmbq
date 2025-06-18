import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import { isValidObjectId } from 'mongoose'

export async function POST(request, { params }) {
  try {
    const { orderId } = params

    // Validate orderId
    if (!orderId || !isValidObjectId(orderId)) {
      return NextResponse.json({ success: false, message: 'Invalid order ID' }, { status: 400 })
    }

    // Get status from request body
    const body = await request.json()
    const { status } = body

    if (!['verified', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification status' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find and update order
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Update payment verification status
    if (!order.paymentVerification) {
      order.paymentVerification = {}
    }

    order.paymentVerification.status = status
    order.paymentVerification.verifiedAt = status === 'verified' ? new Date() : null

    // Update order status based on verification status
    if (status === 'verified') {
      order.status = 'processing'
      order.paid = true
      order.dateOfPayment = new Date()
    } else if (status === 'rejected') {
      order.status = 'cancelled'
      order.paid = false
      order.dateOfPayment = null
    } else {
      order.status = 'pending_verification'
      order.paid = false
      order.dateOfPayment = null
    }

    // Add to timeline
    const timelineEntry = {
      type: 'payment',
      content: `Payment ${status}`,
      date: new Date(),
      status: order.status,
    }

    if (!order.timeline) {
      order.timeline = []
    }
    order.timeline.push(timelineEntry)

    // Save the order
    await order.save()

    // Return updated order
    return NextResponse.json({
      success: true,
      message: `Payment verification ${status}`,
      order: order.toObject(),
    })
  } catch (error) {
    console.error('Error updating payment verification:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update payment verification',
      },
      { status: 500 }
    )
  }
}
