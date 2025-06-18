import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import { verifyAuth, mockAuth } from '@/lib/auth'
import joi from 'joi'
import { isValidObjectId } from 'mongoose'

// Schema for order creation
const orderSchema = joi.object({
  address: joi.object().required(),
  mobile: joi.string().allow(''),
  cart: joi
    .array()
    .items(
      joi.object({
        itemID: joi.string(),
        _id: joi.string(),
        productID: joi.string().required(),
        quantity: joi.number().required(),
        price: joi.number().required(),
        discount: joi.number().required(),
        name: joi.string().required(),
        image: joi.string().required(),
        title: joi.string(),
        finalPrice: joi.number(),
        images: joi.array(),
        img: joi.object(),
        inStock: joi.number(),
        color: joi
          .object({
            id: joi.string().required(),
            name: joi.string().required(),
            hashCode: joi.string().required(),
          })
          .required(),
        size: joi
          .object({
            id: joi.string().required(),
            size: joi.string().required(),
          })
          .required(),
      })
    )
    .required(),
  totalItems: joi.number().required(),
  totalPrice: joi.number().required(),
  subtotalBeforeDiscounts: joi.number(),
  subtotalAfterDiscounts: joi.number(),
  totalDiscount: joi.number().required(),
  paymentMethod: joi.string().required(),
  paymentVerification: joi.object(),
  status: joi.string(),
})

export async function GET(request, context) {
  try {
    // Properly await the params
    const params = await context.params
    const orderId = params.orderId

    // Validate orderId
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 })
    }

    // Validate if orderId is a valid MongoDB ObjectId
    if (!isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find order and populate necessary fields
    const order = await Order.findById(orderId).populate('user', 'name email phone').lean()

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Format the response
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        image: item.image || '/placeholder.png',
      })),
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch order details',
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received order payload:', body)

    // Validate request body
    const { error } = orderSchema.validate(body)
    if (error) {
      console.error('Order validation failed:', error)
      return NextResponse.json(
        { error: 'Order validation failed', details: error.message },
        { status: 400 }
      )
    }

    // Create order
    const order = await Order.create({
      ...body,
      user: authResult.user._id,
      status: 'pending',
    })

    console.log('Order created successfully:', order)
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const { orderId } = params

  try {
    await connectToDatabase()

    // Check auth for admin operations
    let isAdmin = false
    try {
      const authResult = await verifyAuth(request)
      isAdmin = authResult.success && authResult.user && authResult.user.role === 'admin'
    } catch (error) {
      // Continue without admin privileges if auth fails
      console.log('Auth check failed, continuing without admin privileges')
    }

    // Get the update data from the request
    const body = await request.json()
    console.log('Update order request:', { orderId, body })

    // Determine which fields to update
    const updateFields = {}

    // Allow status updates from the modal
    if (body.status) {
      updateFields.status = body.status
    }

    // For admin updates to other fields
    if (isAdmin) {
      // Add other fields that admins can update
      if (body.paymentMethod) updateFields.paymentMethod = body.paymentMethod
      if (body.paymentVerification) updateFields.paymentVerification = body.paymentVerification
      if (body.trackingNumber) updateFields.trackingNumber = body.trackingNumber
      if (body.notes) updateFields.notes = body.notes
    }

    // If no fields to update, return an error
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Find the order by ID or orderId
    const query = orderId.match(/^[0-9a-fA-F]{24}$/) ? { _id: orderId } : { orderId: orderId }

    // Perform the update
    const updatedOrder = await Order.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true } // Return the updated document
    )

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    })
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
  // Implementation for deleting an order goes here
}

export const dynamic = 'force-dynamic'
