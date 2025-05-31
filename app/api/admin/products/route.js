import { NextResponse } from 'next/server'
import { Product } from '@/models'
import { verifyToken } from '@/helpers/jwt'
import { connectToDatabase } from '@/lib/mongoose'
import { connectToDB } from '@/lib/mongoose'

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

export async function GET(req) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || 10
    const page = searchParams.get('page') || 1

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)

    return NextResponse.json({
      success: true,
      data: {
        products,
        total: await Product.countDocuments(),
      },
    })
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectToDB()

    const data = await req.json()
    const product = await Product.create(data)

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 })
  }
}
