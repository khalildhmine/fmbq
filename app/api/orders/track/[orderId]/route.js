import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'
import Order from '@/models/Order'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  console.log('Track order route hit')

  try {
    // Handle orderId extraction properly
    if (!params || !params.orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    const orderId = params.orderId
    console.log('Tracking order:', orderId)

    // Ensure database connection
    await connectToDatabase()

    // Create query based on ID format
    const query = orderId.startsWith('ORD-')
      ? { orderId }
      : mongoose.Types.ObjectId.isValid(orderId)
        ? { _id: orderId }
        : { orderId }

    // Get order with all necessary relations
    const order = await Order.findOne(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'cart.productID',
        select: 'name images price discount stock',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'colors', select: 'name code' },
          { path: 'sizes', select: 'size inStock' },
        ],
      })
      .populate('shippingAddress')
      .populate('paymentVerification')
      .populate({
        path: 'tracking',
        options: { sort: { date: -1 } },
      })
      .lean()

    if (!order) {
      console.log('Order not found:', orderId)
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
          requestedId: orderId,
        },
        { status: 404 }
      )
    }

    // Transform and enrich order data
    const enrichedOrder = {
      ...order,
      cart: order.cart.map(item => ({
        ...item,
        product: item.productID,
        // Clean up response
        productID: undefined,
      })),
      timeline: [
        ...(order.tracking || []).map(track => ({
          ...track,
          type: 'tracking',
          date: track.date,
        })),
        ...(order.paymentVerification
          ? [
              {
                type: 'payment',
                status: order.paymentVerification.status,
                date: order.paymentVerification.image?.uploadedAt || order.updatedAt,
                description: `Payment ${order.paymentVerification.status.toLowerCase()}`,
              },
            ]
          : []),
        {
          type: 'order',
          status: 'created',
          date: order.createdAt,
          description: 'Order placed',
        },
      ].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }

    console.log('Order found and enriched:', order.orderId)
    return NextResponse.json({
      success: true,
      data: enrichedOrder,
    })
  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track order',
        details: error.message,
        code: error.name === 'CastError' ? 'INVALID_ID' : 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
