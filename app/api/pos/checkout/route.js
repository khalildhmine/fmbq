import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { verifyAuth } from '@/lib/auth.ts' // Import verifyAuth from your custom JWT auth module
import Joi from 'joi'
import mongoose from 'mongoose'

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.id || !authResult.isAdmin) {
      console.warn('[Checkout][POST] Unauthorized access attempt')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    console.log('[Checkout][POST] Connected to database')

    const body = await request.json()
    console.log('[Checkout][POST] Request body:', body)

    // Validate incoming data using Joi (simplified for example)
    const schema = Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().required(),
            name: Joi.string().required(), // Ensure name is required
            price: Joi.number().required().min(0),
            quantity: Joi.number().required().integer().min(1),
            total: Joi.number().required().min(0),
            image: Joi.string().allow(null, ''),
            brand: Joi.string().allow(null, ''),
            category: Joi.string().allow(null, ''),
          })
        )
        .min(1)
        .required(),
      totalAmount: Joi.number().required().min(0),
      paymentMethod: Joi.string().valid('cash', 'bankili', 'sedad', 'masrvi').required(),
      customerInfo: Joi.object({
        name: Joi.string().required().messages({ 'string.empty': 'Customer name is required' }),
        phone: Joi.string().allow(null, ''),
        email: Joi.string().email().allow(null, ''),
      }).required(),
      cashierId: Joi.string().required(),
    })

    const { error, value } = schema.validate(body, { abortEarly: false })

    if (error) {
      console.error('[Checkout][POST] Validation error:', error.details)
      return NextResponse.json(
        { success: false, message: error.details[0].message },
        { status: 400 }
      )
    }

    const { items, totalAmount, paymentMethod, customerInfo, cashierId } = value

    // Generate a unique orderId (e.g., timestamp + random string)
    const orderId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Construct order items for Mongoose
    const orderItems = items.map(item => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      name: item.name, // Make sure name is passed
      image: item.image || '', // Ensure image is passed or default to empty string
      qty: item.quantity,
      price: item.price,
      total: item.total,
      // Add other relevant product details if needed
      brand: item.brand || '',
      category: item.category || '',
    }))

    // Create the new order document
    const newOrder = new Order({
      orderId: orderId,
      userId: authResult.id, // Cashier's ID
      user: authResult.id, // Assuming `user` field in Order model stores the cashier's ID
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
      },
      orderItems: orderItems,
      shippingAddress: null, // POS orders typically don't have shipping
      paymentMethod: paymentMethod,
      totalPrice: totalAmount,
      orderStatus: 'completed',
      paidAt: new Date(),
      isPaid: true,
      mobile: customerInfo.phone || '', // Assuming `mobile` field stores customer's phone
      // Add default values for required fields that might be missing
      totalDiscount: 0,
      totalItems: items.length,
      originalPrice: totalAmount, // For POS, original and discounted might be same
      discountedPrice: totalAmount,
    })

    const createdOrder = await newOrder.save()
    console.log('[Checkout][POST] Order created:', createdOrder)

    // Update product stock (assuming you have a Product model)
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    }

    // You might want to also link this order to a user (customer) if customerInfo.email/phone exists
    // For now, it's linked to the cashierId (authResult.id)

    // Return the created order details
    console.log('[Checkout][POST] Sending order to frontend:', {
      receiptNumber: createdOrder.orderId,
      createdAt: createdOrder.createdAt,
      items: createdOrder.orderItems.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        total: item.total,
      })),
      totalAmount: createdOrder.totalPrice,
      paymentMethod: createdOrder.paymentMethod,
      customerInfo: createdOrder.customerInfo,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Order placed successfully!',
        order: {
          receiptNumber: createdOrder.orderId,
          createdAt: createdOrder.createdAt,
          items: createdOrder.orderItems.map(item => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
            total: item.total,
          })),
          totalAmount: createdOrder.totalPrice,
          paymentMethod: createdOrder.paymentMethod,
          customerInfo: createdOrder.customerInfo,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Checkout][POST] Error processing checkout:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
