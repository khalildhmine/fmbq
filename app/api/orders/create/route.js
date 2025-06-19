import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Joi from 'joi'

const orderSchema = Joi.object({
  user: Joi.string().required(),
  cart: Joi.array()
    .items(
      Joi.object({
        itemID: Joi.string().required(),
        _id: Joi.string().required(),
        productID: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        finalPrice: Joi.number().required(),
        discount: Joi.number(),
        quantity: Joi.number().required(),
        image: Joi.string(),
        color: Joi.object({
          id: Joi.string(),
          name: Joi.string(),
          hashCode: Joi.string(),
        }),
        size: Joi.object({
          id: Joi.string(),
          size: Joi.string(),
        }),
      })
    )
    .required(),
  totalItems: Joi.number().required(),
  totalPrice: Joi.number().required(),
  subtotalBeforeDiscounts: Joi.number().required(),
  subtotalAfterDiscounts: Joi.number().required(),
  totalDiscount: Joi.number().required(),
  appliedCoupon: Joi.any(),
  address: Joi.object({
    street: Joi.string(),
    province: Joi.string().required(),
    city: Joi.string().required(),
    area: Joi.string().required(),
    postalCode: Joi.string(),
  }).required(),
  shippingAddress: Joi.object({
    street: Joi.string(),
    province: Joi.string().required(),
    city: Joi.string().required(),
    area: Joi.string().required(),
    postalCode: Joi.string(),
  }).required(),
  mobile: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  shippingCost: Joi.number().default(0),
  status: Joi.string().default('pending_verification'),
  delivered: Joi.boolean().default(false),
  paid: Joi.boolean().default(false),
  tracking: Joi.array().items(
    Joi.object({
      status: Joi.string().required(),
      date: Joi.date().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    })
  ),
  paymentVerification: Joi.object({
    image: Joi.string(),
    status: Joi.string().default('pending'),
    verificationStatus: Joi.string().default('pending'),
    transactionDetails: Joi.object({
      amount: Joi.number(),
      originalAmount: Joi.number(),
      discount: Joi.number(),
      date: Joi.date(),
      verificationStatus: Joi.string(),
    }),
  }),
}).options({ stripUnknown: true })

export async function POST(req) {
  try {
    await connectToDatabase()

    const value = await req.json()
    console.log('Received order payload:', value)

    // Validate the request body
    const { error, value: validatedData } = orderSchema.validate(value)
    if (error) {
      console.error('Order validation error:', error.details)
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error.details.map(detail => detail.message).join(', '),
        },
        { status: 400 }
      )
    }

    // Create order with transformed data
    const orderId = `ORD-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`

    // Transform cart items to match the Order model schema
    const transformedCart = validatedData.cart.map(item => ({
      productID: item.productID,
      baseProductId: item._id, // Use _id as baseProductId
      quantity: item.quantity,
      price: item.finalPrice,
      originalPrice: item.price,
      discount: item.discount || 0,
      name: item.name,
      image: item.image,
      color: item.color || {
        id: 'default',
        name: 'Default',
        hashCode: '#000000',
      },
      size: item.size || {
        id: 'default',
        size: 'One Size',
      },
      model: 'product',
    }))

    const order = new Order({
      ...validatedData,
      cart: transformedCart,
      orderId,
      status: 'pending_verification',
      tracking: [
        {
          status: 'pending_verification',
          description: 'Awaiting payment verification',
          location: 'order.received',
          date: new Date().toISOString(),
        },
      ],
    })

    const savedOrder = await order.save()

    // Update product sales
    try {
      await Promise.all(
        transformedCart.map(async item => {
          const product = await Product.findById(item.baseProductId)
          if (product) {
            await product.updateSales(item.quantity, item.price)
            console.log(`Updated sales for product ${product.title}: +${item.quantity} units`)
          }
        })
      )
    } catch (salesError) {
      console.error('Error updating product sales:', salesError)
      // Don't fail the order creation if sales update fails
    }

    // Prepare notification data
    const notificationData = {
      orderId: savedOrder.orderId,
      _id: savedOrder._id,
      status: savedOrder.status,
      totalPrice: savedOrder.totalPrice,
      createdAt: savedOrder.createdAt,
      customer: {
        name: value.user.name || 'Customer',
        mobile: value.mobile,
      },
      items: savedOrder.cart.length,
      shippingAddress: {
        city: value.shippingAddress.city,
        area: value.shippingAddress.area,
      },
    }

    // Emit socket event using global instance with retry
    if (global.io) {
      try {
        // Emit newOrder event (this will be handled by the socket server)
        global.io.emit('newOrder', {
          ...notificationData,
          type: 'new_order',
          timestamp: new Date(),
        })

        console.log('Order notification sent:', savedOrder.orderId)
      } catch (socketError) {
        console.error('Socket notification error:', socketError)
      }
    } else {
      console.warn('Socket.IO not initialized, notification not sent')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: savedOrder._id,
          orderNumber: savedOrder.orderId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create order',
        status: 'error',
      },
      { status: 500 }
    )
  }
}
