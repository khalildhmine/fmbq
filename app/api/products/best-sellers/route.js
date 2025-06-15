import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Product from '@/models/Product'

export async function GET(request) {
  try {
    await connectToDatabase()

    // Get best selling products based on 'sold' field
    const bestSellers = await Product.find()
      .sort({ sold: -1, createdAt: -1 }) // Sort by sold count, then by date
      .limit(10)
      .populate('brand')
      .populate('category')

    // If no products with sold count, get latest products
    if (!bestSellers.length) {
      const latestProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('brand')
        .populate('category')

      return NextResponse.json({
        success: true,
        data: latestProducts,
      })
    }

    return NextResponse.json({
      success: true,
      data: bestSellers,
    })
  } catch (error) {
    console.error('Error fetching best sellers:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
