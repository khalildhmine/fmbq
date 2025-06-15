import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Order from '@/models/Order'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database'

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection')
      return
    }

    await mongoose.connect(MONGODB_URI)
    console.log('[Delivery Management] Connected to database')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

const verifyToken = async request => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return { success: false, message: 'No token provided' }
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    return { success: true, ...decoded }
  } catch (error) {
    console.error('Token verification error:', error)
    return { success: false, message: 'Invalid token' }
  }
}

// Define valid status transitions for delivery app
const validDeliveryTransitions = {
  pending: 'picked',
  pending_verification: 'picked',
  processing: 'picked',
  picked: 'delivered',
}

// Map delivery app statuses to Order model statuses
const statusMapping = {
  picked: 'picked',
  delivered: 'delivered',
}

export async function PATCH(request, context) {
  try {
    // Verify authentication using JWT
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check role permissions
    if (!authResult.role?.includes('admin') && !authResult.role?.includes('delivery')) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 })
    }

    // Connect to database
    await connectDB()

    // Get orderId from params using context
    const orderId = context.params.orderId
    const { status, location, description } = await request.json()

    const mappedStatus = statusMapping[status]
    if (!mappedStatus) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Check if the transition is valid using the Order model's canTransitionTo method
    if (!order.canTransitionTo(mappedStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status transition from ${order.status} to ${mappedStatus}`,
        },
        { status: 400 }
      )
    }

    // Update order status and add tracking info
    order.status = mappedStatus
    order.tracking.push({
      status: mappedStatus,
      description: description || `Order ${mappedStatus} by delivery agent`,
      location: location || 'N/A',
      date: new Date(),
      updatedBy: authResult.id,
    })

    if (mappedStatus === 'delivered') {
      order.delivered = true
      order.deliveredAt = new Date()
    }

    await order.save()

    return NextResponse.json({
      success: true,
      data: order,
      message: `Order status updated to ${mappedStatus}`,
    })
  } catch (error) {
    console.error('Error updating delivery status:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
