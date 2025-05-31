import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Order } from '@/models'

export async function GET(req) {
  try {
    console.log('Order list API: Starting request processing')

    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const page_size = parseInt(url.searchParams.get('page_size') || '10')

    console.log(`Order list API: Query params - page: ${page}, page_size: ${page_size}`)

    // Connect to database
    await connect()
    console.log('Order list API: Connected to database')

    // Get orders with pagination
    const orders = await Order.find({})
      .populate('user', '-password')
      .skip((page - 1) * page_size)
      .limit(page_size)
      .sort({
        createdAt: 'desc',
      })

    // Count total orders for pagination
    const ordersLength = await Order.countDocuments({})

    console.log(`Order list API: Found ${orders.length} orders out of ${ordersLength} total`)

    // Prepare response
    const result = {
      orders,
      ordersLength,
      pagination: {
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: page_size * page < ordersLength,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(ordersLength / page_size),
      },
    }

    // Return the response
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    console.error('Order list API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get orders',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
