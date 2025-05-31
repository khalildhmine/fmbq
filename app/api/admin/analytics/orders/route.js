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

    console.log(`Generating orders analytics for timeframe: ${timeframe}`)

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

    // Get all orders within the timeframe
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
    }).sort({ createdAt: 1 })

    console.log(`Found ${orders.length} orders for selected timeframe`)

    // Group orders by day/week/month depending on timeframe
    const groupedOrders = {}

    // Prepare date labels and initial data
    let dateLabels = []
    let countData = []

    if (timeframe === 'week') {
      // Daily grouping for week view
      for (let i = 0; i < 7; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() - (6 - i))
        const dateString = date.toISOString().split('T')[0]
        dateLabels.push(dateString)
        groupedOrders[dateString] = 0
      }

      // Count orders by day
      orders.forEach(order => {
        if (!order.createdAt) {
          console.warn(`Order ${order._id} has no createdAt date`)
          return
        }

        const dateString = order.createdAt.toISOString().split('T')[0]
        if (groupedOrders[dateString] !== undefined) {
          groupedOrders[dateString]++
        }
      })
    } else if (timeframe === 'month') {
      // Daily grouping for month view (last 30 days)
      for (let i = 0; i < 30; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() - (29 - i))
        const dateString = date.toISOString().split('T')[0]
        dateLabels.push(dateString)
        groupedOrders[dateString] = 0
      }

      // Count orders by day
      orders.forEach(order => {
        if (!order.createdAt) {
          console.warn(`Order ${order._id} has no createdAt date`)
          return
        }

        const dateString = order.createdAt.toISOString().split('T')[0]
        if (groupedOrders[dateString] !== undefined) {
          groupedOrders[dateString]++
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
        groupedOrders[monthString] = 0
      }

      // Count orders by month
      orders.forEach(order => {
        if (!order.createdAt) {
          console.warn(`Order ${order._id} has no createdAt date`)
          return
        }

        const date = order.createdAt
        const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (groupedOrders[monthString] !== undefined) {
          groupedOrders[monthString]++
        }
      })
    }

    // Extract count data in the same order as labels
    countData = dateLabels.map(label => groupedOrders[label])

    // Calculate summary statistics
    const totalOrders = orders.length
    const averageOrdersPerDay = totalOrders / (timeframe === 'week' ? 7 : 30)

    // Status breakdown
    const ordersByStatus = {
      completed: 0,
      processing: 0,
      shipped: 0,
      pending: 0,
      cancelled: 0,
    }

    orders.forEach(order => {
      // Handle both English and Chinese status formats
      let status = order.status || 'pending'

      // Normalize status values
      status = status.toLowerCase()
      if (status === '已完成') status = 'completed'
      else if (status === '处理中') status = 'processing'
      else if (status === '已发货') status = 'shipped'
      else if (status === '待付款') status = 'pending'
      else if (status === '已取消') status = 'cancelled'
      else if (status === 'delivered') status = 'completed'

      if (ordersByStatus[status] !== undefined) {
        ordersByStatus[status]++
      } else {
        console.warn(`Unknown order status: ${order.status || 'undefined'} for order ${order._id}`)
        // Default to pending for unknown statuses
        ordersByStatus.pending++
      }
    })

    console.log('Orders analytics generated successfully')

    // Return the statistics data
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        dateLabels,
        countData,
        totalOrders,
        averageOrdersPerDay: averageOrdersPerDay.toFixed(2),
        ordersByStatus,
      },
    })
  } catch (error) {
    console.error('Order analytics error:', error)
    return NextResponse.json(
      { message: 'Error fetching order analytics', error: error.message },
      { status: 500 }
    )
  }
}
