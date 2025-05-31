import { NextResponse } from 'next/server'
import Order from '@/models/Order'
import { verifyAuth } from '@/lib/auth'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/helpers/db'

export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const { orderId } = params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('cart.productID', 'name price images')
      .lean()
      .exec()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order:', error.message)
    return NextResponse.json(
      {
        error: 'Failed to fetch order',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const { orderId } = params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 })
    }

    const body = await request.json()
    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition if status is being updated
    if (body.status && !order.canTransitionTo(body.status)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          currentStatus: order.status,
          requestedStatus: body.status,
        },
        { status: 400 }
      )
    }

    // Update allowed fields
    if (body.status) {
      await order.updateStatus(body.status, authResult.user._id)
    }
    if (body.address) order.address = body.address
    if (body.mobile) order.mobile = body.mobile
    if (body.paid !== undefined) {
      order.paid = body.paid
      if (body.paid) {
        order.dateOfPayment = new Date()
      }
    }

    await order.save()

    const updatedOrder = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('cart.productID', 'name price images')
      .lean()

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error.message)
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
