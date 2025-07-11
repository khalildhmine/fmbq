// import { NextResponse } from 'next/server'
// import { connectToDatabase } from '@/helpers/db'
// import Brand from '@/models/Brand'
// import Product from '@/models/Product'

// // Make sure this is set for dynamic data
// export const dynamic = 'force-dynamic'
// export const revalidate = 0

// // Get all brands
// export async function GET(request) {
//   try {
//     await connectToDatabase()

//     // Get all brands with sorting
//     const brands = await Brand.find()
//       .sort({ featured: -1, name: 1 }) // Sort featured brands first, then alphabetically
//       .lean()

//     // Get products for each brand
//     const brandsWithProducts = await Promise.all(
//       brands.map(async brand => {
//         // Get products for this brand
//         const products = await Product.find({ brand: brand._id })
//           .select('_id title price discount images brand category')
//           .populate('category')
//           .sort({ createdAt: -1 })
//           .limit(10)
//           .lean()

//         return {
//           ...brand,
//           products: products.map(product => ({
//             ...product,
//             brand: {
//               _id: brand._id,
//               name: brand.name,
//               logo: brand.logo,
//               color: brand.color,
//             },
//           })),
//         }
//       })
//     )

//     console.log(`Found ${brandsWithProducts.length} total brands`)

//     return NextResponse.json({
//       success: true,
//       data: brandsWithProducts,
//     })
//   } catch (error) {
//     console.error('Error fetching brands:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch brands',
//         error: error.message,
//       },
//       { status: 500 }
//     )
//   }
// }

// // Create a new brand
// export async function POST(request) {
//   try {
//     await connectToDatabase()
//     const body = await request.json()

//     // Basic validation
//     if (!body.name) {
//       return NextResponse.json(
//         { success: false, message: 'Brand name is required' },
//         { status: 400 }
//       )
//     }

//     // Create and save the new brand
//     const brand = new Brand({
//       name: body.name,
//       logo: body.logo || '',
//       color: body.color || '',
//       description: body.description || '',
//       featured: !!body.featured,
//       slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
//     })

//     await brand.save()

//     return NextResponse.json({
//       success: true,
//       message: 'Brand created successfully',
//       data: brand,
//     })
//   } catch (error) {
//     console.error('Error creating brand:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to create brand',
//         error: error.message,
//       },
//       { status: 500 }
//     )
//   }
// }

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Brand from '@/models/Brand'
import Product from '@/models/Product'
import Category from '@/models/Category' // Import Category model

// Ensure dynamic data and no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Fetch all brands with their products
export async function GET(request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Fetch all brands, sorted by featured (descending) and name (ascending)
    const brands = await Brand.find().sort({ featured: -1, name: 1 }).lean()

    // Fetch products for each brand
    const brandsWithProducts = await Promise.all(
      brands.map(async brand => {
        try {
          const products = await Product.find({ brand: brand._id })
            .select('_id title price discount images brand category')
            .populate({
              path: 'category',
              model: Category, // Explicitly reference the Category model
              select: 'name slug',
            })
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
        } catch (error) {
          console.error(`Error fetching products for brand ${brand.name}:`, error)
          return {
            ...brand,
            products: [], // Return empty products array if fetching fails
          }
        }
      })
    )

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

// POST: Create a new brand
export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Create new brand
    const brand = new Brand({
      name: body.name,
      logo: body.logo || '',
      color: body.color || '',
      description: body.description || '',
      featured: !!body.featured,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
    })

    // Save brand to database
    await brand.save()

    return NextResponse.json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create brand',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
