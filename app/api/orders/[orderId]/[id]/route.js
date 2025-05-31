import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import { verifyAuth } from '@/lib/auth'

export async function GET(request, { params }) {
  const { orderId } = params
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const order = await Order.findById(orderId)
      .populate('cart.productID', 'name price images')
      .lean()
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const { orderId } = params
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const body = await request.json()
    const updatedOrder = await Order.findByIdAndUpdate(orderId, body, { new: true }).lean()
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { orderId } = params
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId).lean()
    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order', details: error.message },
      { status: 500 }
    )
  }
}
