import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import Joi from 'joi'
import { emitSocketEvent } from '@/utils/socket'

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      quantity: Joi.number().required(),
      originalPrice: Joi.number().required(),
      discountedPrice: Joi.number().required(),
      color: Joi.object({
        id: Joi.string(),
        name: Joi.string(),
        hashCode: Joi.string(),
      }),
      size: Joi.object({
        id: Joi.string(),
        size: Joi.string(),
      }),
      image: Joi.string(),
    })
  ),
  cart: Joi.array()
    .items(
      Joi.object({
        itemID: Joi.string().required(),
        _id: Joi.string().required(),
        productID: Joi.string().required(),
        baseProductId: Joi.string().required(),
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
  user: Joi.string().required(),
  mobile: Joi.string().required(),
  address: Joi.object({
    province: Joi.object({
      code: Joi.string(),
      name: Joi.string(),
    }),
    city: Joi.object({
      code: Joi.string(),
      name: Joi.string(),
    }),
    area: Joi.object({
      code: Joi.string(),
      name: Joi.string(),
    }),
    street: Joi.string(),
    postalCode: Joi.string(),
  }).required(),
  shippingAddress: Joi.object({
    street: Joi.string(),
    area: Joi.string(),
    city: Joi.string(),
    province: Joi.string(),
    postalCode: Joi.string(),
  }).required(),
  paymentMethod: Joi.string().required(),
  status: Joi.string(),
  delivered: Joi.boolean(),
  paid: Joi.boolean(),
  totalItems: Joi.number().required(),
  totalPrice: Joi.number().required(),
  totalDiscount: Joi.number(),
  subtotalBeforeDiscounts: Joi.number(),
  subtotalAfterDiscounts: Joi.number(),
  paymentVerification: Joi.object({
    image: Joi.object({
      url: Joi.string(),
      publicId: Joi.string(),
      uploadedAt: Joi.string(),
    }),
    status: Joi.string(),
    verificationStatus: Joi.string(),
    transactionDetails: Joi.object({
      amount: Joi.number(),
      originalAmount: Joi.number(),
      discount: Joi.number(),
      date: Joi.string(),
      verificationStatus: Joi.string(),
    }),
  }),
  tracking: Joi.array().items(
    Joi.object({
      status: Joi.string(),
      description: Joi.string(),
      location: Joi.string(),
      date: Joi.string(),
    })
  ),
})

export async function POST(req, res) {
  try {
    await connectToDatabase()
    const orderData = await req.json()
    console.log('Received order payload:', orderData)

    // Debug log for size objects
    console.log('Original size objects:')
    console.log('Items size:', orderData.items?.[0]?.size)
    console.log('Cart size:', orderData.cart?.[0]?.size)

    // Pre-process the size objects before validation
    const processedData = {
      ...orderData,
      items: orderData.items?.map(item => ({
        ...item,
        size:
          item.size && typeof item.size === 'object'
            ? {
                id: String(item.size.id || 'default'),
                size: String(item.size.size || item.size.name || 'One Size'),
              }
            : { id: 'default', size: 'One Size' },
      })),
      cart: orderData.cart?.map(item => ({
        ...item,
        baseProductId: item.productID || item._id,
        size:
          item.size && typeof item.size === 'object'
            ? {
                id: String(item.size.id || 'default'),
                size: String(item.size.size || item.size.name || 'One Size'),
              }
            : { id: 'default', size: 'One Size' },
      })),
    }

    // Debug log for processed size objects
    console.log('Processed size objects:')
    console.log('Items size:', processedData.items?.[0]?.size)
    console.log('Cart size:', processedData.cart?.[0]?.size)

    // Validate order data
    const { error, value } = orderSchema.validate(processedData)
    if (error) {
      console.error('Order validation failed:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid order data',
          error: error.details,
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

    const order = new Order({
      ...value,
      orderId,
      status: 'pending_verification',
      tracking: [
        {
          status: 'pending_verification',
          description: 'Your order is awaiting payment verification',
          location: 'Order received',
          date: new Date().toISOString(),
        },
      ],
    })

    const savedOrder = await order.save()

    // Emit socket event using global instance
    if (global.io) {
      global.io.emit('newOrder', {
        orderId: savedOrder.orderId,
        _id: savedOrder._id,
        status: savedOrder.status,
        totalPrice: savedOrder.totalPrice,
        createdAt: savedOrder.createdAt,
      })
      console.log('Order notification sent:', savedOrder.orderId)
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
