import { NextResponse } from 'next/server'
import { Product } from '@/models'
import { verifyToken } from '@/helpers/jwt'
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

// Function to seed product data if none exists
async function seedProductsIfEmpty() {
  const count = await Product.countDocuments({})

  if (count === 0) {
    console.log('[Admin Products API] No products found, seeding sample data...')

    const sampleProducts = [
      {
        title: 'Wireless Headphones',
        price: 129.99,
        description: 'High-quality wireless headphones with noise cancellation',
        images: [{ url: 'https://via.placeholder.com/300' }],
        category: ['Electronics'],
        inStock: 45,
        sold: 20,
        gender: 'men',
      },
      {
        title: 'Smart Watch',
        price: 199.99,
        description: 'Feature-rich smart watch with health monitoring',
        images: [{ url: 'https://via.placeholder.com/300' }],
        category: ['Electronics'],
        inStock: 30,
        sold: 15,
        gender: 'men',
      },
      {
        title: 'Running Shoes',
        price: 89.99,
        description: 'Comfortable running shoes for professional athletes',
        images: [{ url: 'https://via.placeholder.com/300' }],
        category: ['Footwear'],
        inStock: 50,
        sold: 25,
        gender: 'men',
      },
      {
        title: 'Designer Handbag',
        price: 299.99,
        description: 'Luxury designer handbag made with premium materials',
        images: [{ url: 'https://via.placeholder.com/300' }],
        category: ['Accessories'],
        inStock: 20,
        sold: 10,
        gender: 'women',
      },
    ]

    try {
      await Product.insertMany(sampleProducts)
      console.log('[Admin Products API] Successfully seeded sample products')
    } catch (err) {
      console.error('[Admin Products API] Error seeding products:', err)
    }
  }
}

export async function GET(request) {
  try {
    console.log('[Admin Products API] Request received')

    // Get token and verify admin status
    const token = getTokenFromRequest(request)

    // If no token but we have user header from middleware, proceed
    const userHeader = request.headers.get('user')
    let isAdmin = false

    if (userHeader) {
      try {
        const user = JSON.parse(userHeader)
        isAdmin = user.role === 'admin'
        console.log('[Admin Products API] User from middleware:', { role: user.role, isAdmin })
      } catch (e) {
        console.error('[Admin Products API] Error parsing user header:', e)
      }
    }

    // If we have a token, verify it
    if (token) {
      try {
        const decodedToken = await verifyToken(token)
        if (decodedToken && decodedToken.role === 'admin') {
          isAdmin = true
          console.log('[Admin Products API] Token verification successful')
        }
      } catch (error) {
        console.error('[Admin Products API] Token verification failed:', error)
      }
    }

    // If neither token verification nor middleware confirms admin status
    if (!isAdmin) {
      console.log('[Admin Products API] User is not an admin')
      return NextResponse.json(
        { status: 'error', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Connect to the database
    await connectToDatabase()

    // Check if we need to seed data
    await seedProductsIfEmpty()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const page = parseInt(searchParams.get('page')) || 1
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const category = searchParams.get('category') || null
    const search = searchParams.get('search') || null

    console.log(
      `[Admin Products API] Query params: limit=${limit}, page=${page}, sort=${sort}, order=${order}`
    )

    // Build query
    const query = {}
    if (category) {
      query.category = { $in: [category] }
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Count total products for pagination
    const total = await Product.countDocuments(query)
    console.log(`[Admin Products API] Total products matching query: ${total}`)

    // Get products with pagination and sorting
    const sortOptions = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    console.log(`[Admin Products API] Executing query with sort: ${JSON.stringify(sortOptions)}`)
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    console.log(`[Admin Products API] Products found: ${products.length}`)

    // Log the first product for debugging
    if (products.length > 0) {
      console.log('First product sample:', {
        id: products[0]._id,
        title: products[0].title,
        price: products[0].price,
        inStock: products[0].inStock,
      })
    }

    // Format products for response
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      title: product.title || 'Untitled Product',
      price: parseFloat(product.price) || 0,
      description: product.description || '',
      images: product.images || [],
      category: Array.isArray(product.category)
        ? product.category[0]
        : product.category || 'Uncategorized',
      inStock: parseInt(product.inStock) || 0,
      sold: parseInt(product.sold) || 0,
      createdAt: product.createdAt || new Date(),
    }))

    // Log the formatted data before sending
    console.log('[Admin Products API] Sending response with products:', formattedProducts.length)

    // Format response with explicit type conversion
    const responseData = {
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total: Number(total) || 0,
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[Admin Products API] Error:', error)
    return NextResponse.json(
      { message: 'Error fetching products', error: error.message },
      { status: 500 }
    )
  }
}
