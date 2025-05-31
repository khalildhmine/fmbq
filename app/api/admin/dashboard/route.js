import { NextResponse } from 'next/server'
import Order from '@/models/Order'
import User from '@/models/User'
import { Product } from '@/models'
import { verifyToken } from '@/helpers/jwt'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/helpers/db'

// Helper to get token from request
const getTokenFromRequest = req => {
  try {
    // First check Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1]
    }

    // Then check user header (set by middleware)
    const userHeader = req.headers.get('user')
    if (userHeader) {
      try {
        const user = JSON.parse(userHeader)
        if (user.token) {
          return user.token
        }
      } catch (e) {
        console.error('Error parsing user header:', e)
      }
    }

    // Finally check cookies
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
      if (tokenCookie) {
        return decodeURIComponent(tokenCookie.split('=')[1])
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting token:', error)
    return null
  }
}

// Function to seed order data if none exists
async function seedOrdersIfEmpty() {
  const count = await Order.countDocuments({})

  if (count === 0) {
    console.log('[Dashboard API] No orders found, seeding sample data...')

    // Get or create a user for the orders
    let userId
    const adminUser = await User.findOne({ role: 'admin' })
    if (adminUser) {
      userId = adminUser._id
    } else {
      // Create a default admin user if none exists
      try {
        const newUser = new User({
          name: 'Admin User',
          email: 'admin@example.com',
          password: '$2a$10$yywhOoUlVCM2Hc/VqB3dHejcK2Mi93D8jfdA9uPrKYeYaZypTJBa6', // 'admin123'
          role: 'admin',
        })
        await newUser.save()
        console.log('[Dashboard API] Created admin user for testing:', {
          email: 'admin@example.com',
          password: 'admin123',
        })
        userId = newUser._id
      } catch (err) {
        console.error('[Dashboard API] Error creating admin user:', err)
        return
      }
    }

    // Get some products or use placeholder IDs
    const products = await Product.find().limit(2).lean()
    const productIds =
      products.length > 0
        ? products.map(p => p._id)
        : [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]

    const sampleOrders = [
      {
        user: userId,
        address: {
          street: '123 Main St',
          city: 'New York',
          area: 'Manhattan',
          province: 'NY',
          postalCode: '10001',
        },
        mobile: '555-1234',
        cart: [
          {
            productID: productIds[0],
            quantity: 2,
            price: 129.99,
            discount: 0,
            name: 'Sample Product 1',
            image: 'https://via.placeholder.com/300',
            color: {
              id: '1',
              name: 'Black',
              hashCode: '#000000',
            },
            size: {
              id: '1',
              size: 'M',
            },
          },
        ],
        totalItems: 2,
        totalPrice: 259.98,
        totalDiscount: 0,
        paymentMethod: 'credit_card',
        status: 'completed',
        timeline: [
          {
            type: 'status',
            content: 'Order completed',
            userId: userId,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
        ],
        delivered: true,
        paid: true,
        dateOfPayment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        user: userId,
        address: {
          street: '456 Broadway',
          city: 'New York',
          area: 'Brooklyn',
          province: 'NY',
          postalCode: '10002',
        },
        mobile: '555-5678',
        cart: [
          {
            productID: productIds[0],
            quantity: 1,
            price: 199.99,
            discount: 0,
            name: 'Sample Product 2',
            image: 'https://via.placeholder.com/300',
            color: {
              id: '2',
              name: 'Silver',
              hashCode: '#C0C0C0',
            },
            size: {
              id: '2',
              size: 'L',
            },
          },
        ],
        totalItems: 1,
        totalPrice: 199.99,
        totalDiscount: 0,
        paymentMethod: 'credit_card',
        status: 'pending',
        timeline: [
          {
            type: 'status',
            content: 'Order placed',
            userId: userId,
            createdAt: new Date(), // Now
          },
        ],
        delivered: false,
        paid: true,
        dateOfPayment: new Date(),
      },
    ]

    try {
      await Order.insertMany(sampleOrders)
      console.log('[Dashboard API] Successfully seeded sample orders')
    } catch (err) {
      console.error('[Dashboard API] Error seeding orders:', err)
    }
  }
}

export async function GET(request) {
  try {
    // Get token and verify admin status
    const token = getTokenFromRequest(request)

    // If no token but we have user header from middleware, proceed
    const userHeader = request.headers.get('user')
    let isAdmin = false

    if (userHeader) {
      try {
        const user = JSON.parse(userHeader)
        isAdmin = user.role === 'admin'
      } catch (e) {
        console.error('Error parsing user header:', e)
      }
    }

    // If we have a token, verify it
    if (token) {
      try {
        const decodedToken = await verifyToken(token)
        if (decodedToken && decodedToken.role === 'admin') {
          isAdmin = true
        }
      } catch (error) {
        console.error('Token verification failed:', error)
      }
    }

    // If neither token verification nor middleware confirms admin status
    if (!isAdmin) {
      console.log('User is not an admin')
      return NextResponse.json(
        { status: 'error', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Connect to the database
    await connectToDatabase()

    // Check if orders need to be created
    await seedOrdersIfEmpty()

    console.log('Fetching dashboard statistics...')

    // ==== ORDERS CALCULATION ====
    // Get total orders and calculate revenue from completed orders
    const allOrders = (await Order.find({}).lean()) || []
    console.log(`Total orders found: ${allOrders.length}`)

    // Log a sample order to check structure
    if (allOrders.length > 0) {
      console.log(
        'Sample order structure:',
        JSON.stringify(
          {
            id: allOrders[0]._id,
            status: allOrders[0].status,
            totalPrice: allOrders[0].totalPrice,
            cart: Array.isArray(allOrders[0].cart) ? allOrders[0].cart.length : 'Not an array',
            createdAt: allOrders[0].createdAt,
          },
          null,
          2
        )
      )
    } else {
      console.log('No orders found in the database')
    }

    const totalOrders = allOrders.length

    // Calculate total revenue from ALL orders for now
    let totalRevenue = 0

    // More robust revenue calculation
    allOrders.forEach((order, index) => {
      try {
        const price = parseFloat(order.totalPrice)
        if (!isNaN(price)) {
          totalRevenue += price
          if (index < 3)
            console.log(`Order ${order._id}: Added price ${price}, running total: ${totalRevenue}`)
        } else {
          console.warn(
            `Invalid order price (NaN) found: ${order.totalPrice} for order ${order._id}`
          )
        }
      } catch (err) {
        console.error(`Error processing order ${order._id}:`, err.message)
      }
    })

    console.log(`Calculated total revenue: ${totalRevenue}`)

    // ==== PRODUCTS CALCULATION ====
    // Get total products - with more robust error handling
    let totalProducts = 0
    try {
      totalProducts = await Product.countDocuments({})
      console.log(`Total products found: ${totalProducts}`)

      // Log a sample product to check structure
      const sampleProduct = await Product.findOne({}).lean()
      if (sampleProduct) {
        console.log(
          'Sample product structure:',
          JSON.stringify(
            {
              id: sampleProduct._id,
              title: sampleProduct.title,
              price: sampleProduct.price,
            },
            null,
            2
          )
        )
      } else {
        console.log('No products found in database')
      }
    } catch (err) {
      console.error('Error fetching products:', err.message)
    }

    // ==== USERS CALCULATION ====
    // Get total users (excluding admins) - with more robust error handling
    let totalUsers = 0
    try {
      totalUsers = await User.countDocuments({ role: { $ne: 'admin' } })
      console.log(`Total users found: ${totalUsers}`)
    } catch (err) {
      console.error('Error fetching users:', err.message)
    }

    // ==== RECENT ORDERS ====
    // Get recent orders (last 5) - with more robust error handling
    let recentOrders = []
    try {
      recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .lean()
    } catch (err) {
      console.error('Error fetching recent orders:', err.message)
    }

    // Format recent orders for display
    const formattedRecentOrders = recentOrders.map(order => {
      try {
        // Extract price and ensure it's a number
        let price = 0
        if (typeof order.totalPrice === 'number') {
          price = order.totalPrice
        } else if (typeof order.totalPrice === 'string') {
          price = parseFloat(order.totalPrice.replace(/[^\d.-]/g, ''))
        }

        return {
          id: order._id?.toString?.() || 'Unknown ID',
          customer: order.user?.name || 'Guest',
          amount: `MRU ${(price || 0).toFixed(2)}`,
          status: order.status || 'Unknown',
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('zh-CN')
            : 'Unknown Date',
        }
      } catch (err) {
        console.error(`Error formatting order ${order._id}:`, err.message)
        return {
          id: 'Error',
          customer: 'Error',
          amount: 'MRU 0.00',
          status: 'Error',
          date: 'Error',
        }
      }
    })

    console.log('Dashboard statistics generated successfully')

    // Count pending orders
    const pendingOrders = allOrders.filter(order => {
      const status = order.status?.toLowerCase?.() || ''
      return status === 'pending' || status === '待处理'
    }).length

    // Return the statistics data with explicit type conversion
    const responseData = {
      success: true,
      data: {
        totalOrders: Number(totalOrders) || 0,
        totalUsers: Number(totalUsers) || 0,
        totalProducts: Number(totalProducts) || 0,
        totalRevenue: (Number(totalRevenue) || 0).toFixed(2),
        pendingOrders: Number(pendingOrders) || 0,
        recentOrders: formattedRecentOrders || [],
      },
    }

    console.log('Response data sample:', {
      totalOrders: responseData.data.totalOrders,
      totalProducts: responseData.data.totalProducts,
      totalRevenue: responseData.data.totalRevenue,
      pendingOrders: responseData.data.pendingOrders,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Dashboard statistics error:', error)
    return NextResponse.json(
      { message: 'Error fetching dashboard statistics', error: error.message },
      { status: 500 }
    )
  }
}
