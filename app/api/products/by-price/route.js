import { connectToDatabase } from '@/helpers/db'
import { setJson, errorHandler } from '@/helpers/api'

export async function GET(req) {
  try {
    console.log('⭐ API - getProductsByPrice called')

    // Parse URL search parameters
    const url = new URL(req.url)
    const minPrice = Number(url.searchParams.get('min') || 0)
    const maxPrice = Number(url.searchParams.get('max') || 999)
    const limit = Number(url.searchParams.get('limit') || 20)
    const sort = url.searchParams.get('sort') || 'price-asc'
    const category = url.searchParams.get('category') || null

    console.log('⭐ Price range params:', { minPrice, maxPrice, limit, sort, category })

    // Get database connection
    const connection = await connectToDatabase()
    if (!connection || !connection.db) {
      console.error('⭐ Database connection failed in getProductsByPrice')
      throw new Error('Database connection failed')
    }

    const db = connection.db
    const collection = db.collection('products')

    // Build price filter
    const filter = {
      price: { $gte: minPrice, $lte: maxPrice },
      inStock: { $gt: 0 }, // Only show in-stock products
    }

    // Add category filter if provided
    if (category) {
      filter.category = category
    }

    // Determine sort order
    let sortOption = {}
    if (sort === 'price-asc') {
      sortOption = { price: 1 }
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 }
    } else if (sort === 'latest') {
      sortOption = { createdAt: -1 }
    }

    console.log('⭐ Filter:', filter)
    console.log('⭐ Sort:', sortOption)

    // Get products matching the price range
    const products = await collection.find(filter).sort(sortOption).limit(limit).toArray()

    console.log(`⭐ Found ${products.length} products in price range $${minPrice}-$${maxPrice}`)

    // Get total count for this price range
    const total = await collection.countDocuments(filter)

    // Enhanced products with additional UI data
    const enhancedProducts = products.map(product => ({
      ...product,
      // Add UI-friendly properties
      isNew: product.createdAt
        ? new Date().getTime() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
        : false,
      isSale: product.discount && product.discount > 0,
      saleBadge: product.discount > 25 ? 'HOT DEAL' : product.discount > 0 ? 'SALE' : null,
      formattedPrice: `$${product.price.toFixed(2)}`,
      salePrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : null,
      formattedSalePrice:
        product.discount > 0
          ? `$${(product.price * (1 - product.discount / 100)).toFixed(2)}`
          : null,
    }))

    // Format the response to match what our app expects
    return setJson({
      success: true,
      products: enhancedProducts,
      total,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
      data: {
        products: enhancedProducts,
        pagination: {
          total,
          page: 1,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('⭐ API Error in getProductsByPrice:', error)
    return errorHandler(error)
  }
}

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
