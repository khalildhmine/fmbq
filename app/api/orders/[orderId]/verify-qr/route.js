import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/models/Order'
import jwt from 'jsonwebtoken'
import { generateQRHash, verifyQRHash } from '@/utils/qr'

// Define order status progression
const ORDER_STATUS_FLOW = {
  pending: 'picked',
  picked: 'on_the_way',
  on_the_way: 'delivered',
  delivered: 'delivered', // Terminal state
}

// Helper function to verify token and get decoded data
const verifyToken = token => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    if (!decoded || !decoded.id) {
      return { success: false, message: 'Invalid token' }
    }
    if (!decoded.role || (decoded.role !== 'delivery' && decoded.role !== 'admin')) {
      return { success: false, message: 'Unauthorized: Delivery personnel only' }
    }
    return { success: true, decoded }
  } catch (error) {
    return { success: false, message: 'Invalid token' }
  }
}

export async function POST(request) {
  try {
    // Get the Bearer token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token found' }, { status: 401 })
    }

    // Verify JWT token
    const authResult = verifyToken(token)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }
    const { decoded } = authResult

    // Get orderId from URL
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const orderId = segments.find(
      segment => segment.match(/^[0-9a-fA-F]{24}$/) // Match MongoDB ObjectId format
    )

    const { qrCode } = await request.json()

    if (!orderId || !qrCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID and QR code are required',
          details: {
            orderId: orderId ? 'valid' : 'missing',
            qrCode: qrCode ? 'valid' : 'missing',
          },
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    console.log('Debug - Order ID:', order._id.toString())
    console.log('Debug - Received QR Code:', qrCode)
    console.log('Debug - Expected Hash:', generateQRHash(order._id.toString()))

    // Verify QR code hash
    const isValid = verifyQRHash(order._id.toString(), qrCode)
    if (!isValid) {
      const expectedHash = generateQRHash(order._id.toString())
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid QR code',
          details: {
            orderId: order._id.toString(),
            expected: expectedHash,
            provided: qrCode,
            note: 'The QR code should contain the hash, not the order ID',
          },
        },
        { status: 400 }
      )
    }

    // Get next status based on current status
    const currentStatus = order.status || 'pending'
    const nextStatus = ORDER_STATUS_FLOW[currentStatus]

    if (!nextStatus) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid order status transition',
          details: {
            currentStatus,
            possibleTransitions: Object.keys(ORDER_STATUS_FLOW),
          },
        },
        { status: 400 }
      )
    }

    // Update order status
    order.status = nextStatus
    order.statusHistory = order.statusHistory || []
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      updatedBy: decoded.id,
    })

    // Save the updated order
    await order.save()

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${nextStatus}`,
      data: {
        orderId: order._id,
        status: nextStatus,
        previousStatus: currentStatus,
        qrVerified: true,
      },
    })
  } catch (error) {
    console.error('QR verification error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify QR code',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
