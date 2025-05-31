import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import Order from '@/models/Order'
import { verifyAuth } from '@/lib/auth'

export async function GET(request) {
  try {
    // Verify authentication and admin role
    const { userId, role } = await verifyAuth(request)

    if (!userId || role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get timeframe from query params (default to month)
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    console.log(`Generating revenue analytics for timeframe: ${timeframe}`)

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()

    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1) // Default to month
    }

    // Get completed/paid orders within the timeframe
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
      status: { $in: ['completed', 'shipped', '已完成', '已发货'] }, // Only include completed or shipped orders for revenue
    }).sort({ createdAt: 1 })

    console.log(`Found ${orders.length} completed orders for selected timeframe`)

    // Group revenue by day/week/month depending on timeframe
    const groupedRevenue = {}

    // Prepare date labels and initial data
    let dateLabels = []
    let revenueData = []

    if (timeframe === 'week') {
      // Daily grouping for week view
      for (let i = 0; i < 7; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() - (6 - i))
        const dateString = date.toISOString().split('T')[0]
        dateLabels.push(dateString)
        groupedRevenue[dateString] = 0
      }

      // Sum revenue by day
      orders.forEach(order => {
        const dateString = order.createdAt.toISOString().split('T')[0]
        if (groupedRevenue[dateString] !== undefined) {
          const amount = Number(order.totalPrice || order.totalAmount || 0)
          if (!isNaN(amount)) {
            groupedRevenue[dateString] += amount
          } else {
            console.warn(
              `Invalid order amount for order ${order._id}: ${
                order.totalPrice || order.totalAmount
              }`
            )
          }
        }
      })
    } else if (timeframe === 'month') {
      // Daily grouping for month view (last 30 days)
      for (let i = 0; i < 30; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() - (29 - i))
        const dateString = date.toISOString().split('T')[0]
        dateLabels.push(dateString)
        groupedRevenue[dateString] = 0
      }

      // Sum revenue by day
      orders.forEach(order => {
        const dateString = order.createdAt.toISOString().split('T')[0]
        if (groupedRevenue[dateString] !== undefined) {
          const amount = Number(order.totalPrice || order.totalAmount || 0)
          if (!isNaN(amount)) {
            groupedRevenue[dateString] += amount
          } else {
            console.warn(
              `Invalid order amount for order ${order._id}: ${
                order.totalPrice || order.totalAmount
              }`
            )
          }
        }
      })
    } else {
      // Monthly grouping for quarter and year
      const monthCount = timeframe === 'quarter' ? 3 : 12

      for (let i = 0; i < monthCount; i++) {
        const date = new Date(now)
        date.setMonth(now.getMonth() - (monthCount - 1 - i))
        const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        dateLabels.push(monthString)
        groupedRevenue[monthString] = 0
      }

      // Sum revenue by month
      orders.forEach(order => {
        const date = order.createdAt
        const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (groupedRevenue[monthString] !== undefined) {
          const amount = Number(order.totalPrice || order.totalAmount || 0)
          if (!isNaN(amount)) {
            groupedRevenue[monthString] += amount
          } else {
            console.warn(
              `Invalid order amount for order ${order._id}: ${
                order.totalPrice || order.totalAmount
              }`
            )
          }
        }
      })
    }

    // Extract revenue data in the same order as labels
    revenueData = dateLabels.map(label => groupedRevenue[label])

    // Calculate summary statistics
    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0)

    let averageOrderValue = 0
    if (orders.length > 0) {
      let validOrdersSum = 0
      let validOrdersCount = 0

      orders.forEach(order => {
        const amount = Number(order.totalPrice || order.totalAmount || 0)
        if (!isNaN(amount)) {
          validOrdersSum += amount
          validOrdersCount++
        }
      })

      averageOrderValue = validOrdersCount > 0 ? (validOrdersSum / validOrdersCount).toFixed(2) : 0
    }

    // Revenue by product category
    const orderItems = orders.flatMap(order => order.items || order.cart || [])
    const revenueByCategory = {}

    orderItems.forEach(item => {
      let category = item.category
      // If category is not directly available, try to extract from product data
      if (!category && item.productID && item.productID.category) {
        category = item.productID.category
      }

      if (category) {
        if (!revenueByCategory[category]) {
          revenueByCategory[category] = 0
        }

        const price = Number(item.price || 0)
        const quantity = Number(item.quantity || 1)

        if (!isNaN(price) && !isNaN(quantity)) {
          revenueByCategory[category] += price * quantity
        }
      }
    })

    console.log('Revenue analytics generated successfully')

    // Return the statistics data
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        dateLabels,
        revenueData,
        totalRevenue,
        averageOrderValue,
        revenueByCategory,
      },
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json(
      { message: 'Error fetching revenue analytics', error: error.message },
      { status: 500 }
    )
  }
}
