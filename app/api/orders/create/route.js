import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Order from '@/models/Order'
import Joi from 'joi'
import nodemailer from 'nodemailer'
import User from '@/models/User'
import Product from '@/models/Product'

// Update the order schema to include points redemption
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

// Update points logic: 1 point = 0.03 MRU
const POINT_TO_MRU = 0.03

export async function POST(request) {
  try {
    await connectToDatabase()

    const body = await request.json()
    console.log('Received order payload:', body)

    // Validate the request body
    const { error, value: validatedData } = orderSchema.validate(body)
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

    // Handle points redemption if applicable
    if (validatedData.pointsRedeemed > 0) {
      try {
        // Find the user
        const user = await User.findById(validatedData.user)

        if (!user) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        // Check if user has enough points
        if (user.coins < validatedData.pointsRedeemed) {
          return NextResponse.json(
            { success: false, message: 'Not enough points available' },
            { status: 400 }
          )
        }

        // Deduct points from user
        user.coins -= validatedData.pointsRedeemed

        // Add points transaction to history if you have that model
        if (user.pointsHistory) {
          user.pointsHistory.push({
            amount: -validatedData.pointsRedeemed,
            reason: `Redeemed for order discount`,
            date: new Date(),
          })
        }

        await user.save()
        console.log(`Deducted ${validatedData.pointsRedeemed} points from user ${user._id}`)
      } catch (pointsError) {
        console.error('Error processing points redemption:', pointsError)
        return NextResponse.json(
          { success: false, message: 'Failed to process points redemption' },
          { status: 500 }
        )
      }
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

    // Include points information in the order
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
      // Add points information to the order
      pointsRedeemed: validatedData.pointsRedeemed || 0,
      pointsDiscount:
        validatedData.pointsRedeemed > 0 ? Math.floor(validatedData.pointsRedeemed / 100) * 40 : 0,
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
        name: validatedData.user.name || 'Customer',
        mobile: validatedData.mobile,
      },
      items: savedOrder.cart.length,
      shippingAddress: {
        city: validatedData.shippingAddress.city,
        area: validatedData.shippingAddress.area,
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

    // Send email notification to abdel_sid2607@yahoo.fr and dhminekhalil@gmail.com
    try {
      // Configure transporter (use your SMTP credentials in production)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'ilokakilos@gmail.com', // replace with your email or use env
          pass: process.env.EMAIL_PASS || 'qkzp xfhx ihqp wopw', // replace with your app password or use env
        },
      })

      // Build cart details HTML
      const cartRows = savedOrder.cart
        .map(
          (item, idx) => `
            <tr>
              <td style="padding:4px 8px;border:1px solid #ddd;">${idx + 1}</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">
                <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" />
              </td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.name}</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.color?.name || '-'}</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.size?.size || '-'}</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.quantity}</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.price} MRU</td>
              <td style="padding:4px 8px;border:1px solid #ddd;">${item.discount || 0} MRU</td>
            </tr>
          `
        )
        .join('')

      const cartTable = `
        <table style="border-collapse:collapse;width:100%;margin-top:12px;">
          <thead>
            <tr>
              <th style="padding:4px 8px;border:1px solid #ddd;">#</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Image</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Product</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Color</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Size</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Qty</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Price</th>
              <th style="padding:4px 8px;border:1px solid #ddd;">Discount</th>
            </tr>
          </thead>
          <tbody>
            ${cartRows}
          </tbody>
        </table>
      `

      // Order summary details
      const orderSummary = `
        <ul style="list-style:none;padding:0;">
          <li><b>Order Number:</b> ${savedOrder.orderId}</li>
          <li><b>Customer:</b> ${validatedData.user.name || 'Customer'}</li>
          <li><b>Mobile:</b> ${validatedData.mobile}</li>
          <li><b>Address:</b> ${savedOrder.shippingAddress?.street || ''}, ${savedOrder.shippingAddress?.area || ''}, ${savedOrder.shippingAddress?.city || ''}, ${savedOrder.shippingAddress?.province || ''}, ${savedOrder.shippingAddress?.postalCode || ''}</li>
          <li><b>Payment Method:</b> ${savedOrder.paymentMethod}</li>
          <li><b>Status:</b> ${savedOrder.status}</li>
          <li><b>Total Items:</b> ${savedOrder.totalItems}</li>
          <li><b>Subtotal Before Discounts:</b> ${savedOrder.subtotalBeforeDiscounts} MRU</li>
          <li><b>Total Discount:</b> ${savedOrder.totalDiscount} MRU</li>
          <li><b>Shipping Cost:</b> ${savedOrder.shippingCost || 0} MRU</li>
          <li><b>Total Price:</b> <span style="color:#007b00;font-weight:bold;">${savedOrder.totalPrice} MRU</span></li>
          <li><b>Order Date:</b> ${new Date(savedOrder.createdAt).toLocaleString('fr-FR')}</li>
        </ul>
      `

      const mailOptions = {
        from: process.env.EMAIL_USER || 'ilokakilos@gmail.com',
        to: ['formen.boutiqueen@gmail.com', 'dhminekhalil@gmail.com'],
        subject: `🛒 Nouvelle commande reçue: ${savedOrder.orderId}`,
        text: `A new order has been placed.\nOrder Number: ${savedOrder.orderId}\nCustomer: ${validatedData.user.name || 'Customer'}\nTotal Price: ${savedOrder.totalPrice}\n\nPlease check the admin panel for more details.`,
        html: `
          <div style="font-family:sans-serif;">
            <h2 style="color:#007b00;">Nouvelle commande reçue</h2>
            ${orderSummary}
            <h3 style="margin-top:24px;">Détails du panier</h3>
            ${cartTable}
            <p style="margin-top:24px;">Merci de vérifier le panneau d'administration.</p>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      console.log(
        'Order email notification sent to abdel_sid2607@yahoo.fr and dhminekhalil@gmail.com'
      )
    } catch (emailError) {
      console.error('Failed to send order email notification:', emailError)
      // Don't fail the order creation if email fails
    }

    // Calculate coins to earn (example: 1 point per 10 MRU spent after discounts)
    const totalAfterDiscounts = validatedData.subtotalAfterDiscounts || 0
    // Earned points: totalAfterDiscounts / (1 point = 0.03 MRU)
    const pointsEarned = Math.floor(totalAfterDiscounts / (1 / POINT_TO_MRU))

    // Deduct redeemed points if any
    if (validatedData.pointsRedeemed > 0 && validatedData.user) {
      const user = await User.findById(validatedData.user)
      if (user) {
        // Deduct used points
        user.coins = Math.max(0, (user.coins || 0) - validatedData.pointsRedeemed)
        user.coinsHistory = user.coinsHistory || []
        user.coinsHistory.push({
          amount: -Math.abs(validatedData.pointsRedeemed),
          type: 'spent',
          orderId: savedOrder?._id,
          description: 'Coins redeemed for order',
          createdAt: new Date(),
        })
        // Add earned points
        if (pointsEarned > 0) {
          user.coins += pointsEarned
          user.coinsHistory.push({
            amount: pointsEarned,
            type: 'earned',
            orderId: savedOrder?._id,
            description: 'Coins earned from order',
            createdAt: new Date(),
          })
        }
        await user.save()
      }
    } else if (validatedData.user && pointsEarned > 0) {
      // If no points redeemed, just add earned points
      const user = await User.findById(validatedData.user)
      if (user) {
        user.coins = (user.coins || 0) + pointsEarned
        user.coinsHistory = user.coinsHistory || []
        user.coinsHistory.push({
          amount: pointsEarned,
          type: 'earned',
          orderId: savedOrder?._id,
          description: 'Coins earned from order',
          createdAt: new Date(),
        })
        await user.save()
      }
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
