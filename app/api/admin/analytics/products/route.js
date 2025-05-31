import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import { Order, Product } from '@/models'
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
    const limit = parseInt(searchParams.get('limit') || '10')

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

    // Get all products
    const products = await Product.find({}).lean()

    // Get completed orders within the timeframe
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
      status: { $in: ['completed', 'shipped', '已完成', '已发货'] },
    }).lean()

    // Calculate products sold
    const productSales = {}
    const productRevenue = {}

    // Initialize with all products to include those with 0 sales
    products.forEach(product => {
      productSales[product._id.toString()] = {
        id: product._id.toString(),
        title: product.title,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.images?.[0] || '',
        quantitySold: 0,
        revenue: 0,
      }
    })

    // Process all orders to get sales data
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productId = item.productId?.toString()
          if (productId && productSales[productId]) {
            productSales[productId].quantitySold += item.quantity || 0
            productSales[productId].revenue += item.price * item.quantity || 0
          }
        })
      }
    })

    // Convert to array and sort by quantity sold
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit)

    // Sort by revenue
    const topRevenueProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    // Get category breakdown
    const categorySales = {}
    const categoryRevenue = {}

    Object.values(productSales).forEach(product => {
      if (product.category) {
        if (!categorySales[product.category]) {
          categorySales[product.category] = 0
          categoryRevenue[product.category] = 0
        }
        categorySales[product.category] += product.quantitySold
        categoryRevenue[product.category] += product.revenue
      }
    })

    // Calculate low stock products (less than 10 items)
    const lowStockProducts = products
      .filter(product => (product.stock || 0) < 10)
      .map(product => ({
        id: product._id.toString(),
        title: product.title,
        stock: product.stock || 0,
        category: product.category,
        image: product.images?.[0] || '',
      }))
      .slice(0, limit)

    // Calculate out of stock products
    const outOfStockCount = products.filter(product => (product.stock || 0) === 0).length

    // Get total product count
    const totalProductCount = products.length

    // Calculate total units sold
    const totalUnitsSold = Object.values(productSales).reduce(
      (total, product) => total + product.quantitySold,
      0
    )

    // Return the analytics data
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        topSellingProducts,
        topRevenueProducts,
        categorySales,
        categoryRevenue,
        lowStockProducts,
        outOfStockCount,
        totalProductCount,
        totalUnitsSold,
      },
    })
  } catch (error) {
    console.error('Product analytics error:', error)
    return NextResponse.json(
      { message: 'Error fetching product analytics', error: error.message },
      { status: 500 }
    )
  }
}
