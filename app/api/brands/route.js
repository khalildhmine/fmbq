import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Brand from '@/models/Brand'
import Product from '@/models/Product'

// Make sure this is set for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Get all brands
export async function GET(request) {
  try {
    await connectToDatabase()

    // Get all brands with sorting
    const brands = await Brand.find()
      .sort({ featured: -1, name: 1 }) // Sort featured brands first, then alphabetically
      .lean()

    // Get products for each brand
    const brandsWithProducts = await Promise.all(
      brands.map(async brand => {
        // Get products for this brand
        const products = await Product.find({ brand: brand._id })
          .select('_id title price discount images brand category')
          .populate('category')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()

        return {
          ...brand,
          products: products.map(product => ({
            ...product,
            brand: {
              _id: brand._id,
              name: brand.name,
              logo: brand.logo,
              color: brand.color,
            },
          })),
        }
      })
    )

    console.log(`Found ${brandsWithProducts.length} total brands`)

    return NextResponse.json({
      success: true,
      data: brandsWithProducts,
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch brands',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
