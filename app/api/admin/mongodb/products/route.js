import { NextResponse } from 'next/server'
import { Product } from '@/models'
import { connectDb } from '@/lib/db'

// GET handler to fetch products directly from MongoDB
export async function GET(req) {
  console.log('⭐ API - directGetProducts called')
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    console.log('⭐ Direct MongoDB query params:', { limit, page, skip })

    // Connect to MongoDB
    await connectDb()
    console.log('⭐ Database connection successful')

    // Get all products with basic pagination
    const products = await Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const totalProducts = await Product.countDocuments({})

    console.log(`⭐ Found ${products.length} products out of ${totalProducts} total`)

    // Return the products
    return NextResponse.json({
      success: true,
      products,
      pagination: {
        totalItems: totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        itemsPerPage: limit,
      },
    })
  } catch (error) {
    console.error('❌ Error in directGetProducts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    )
  }
}
