import { NextResponse } from 'next/server'
import { Product } from '@/models'

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
}

// Keep track of requests for rate limiting
const requestLog = new Map()

// Check rate limit
const checkRateLimit = ip => {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowMs

  // Clean up old entries
  for (const [key, time] of requestLog.entries()) {
    if (time < windowStart) requestLog.delete(key)
  }

  // Count requests in current window
  const requests = Array.from(requestLog.entries()).filter(
    ([key, time]) => key.startsWith(ip) && time > windowStart
  ).length

  return requests < RATE_LIMIT.maxRequests
}

// Find products based on labels
const findProductsByLabels = async labels => {
  try {
    // Create search query from labels
    const searchTerms = labels.map(({ label }) => label)

    const searchQuery = {
      $or: [
        { name: { $regex: searchTerms.join('|'), $options: 'i' } },
        { description: { $regex: searchTerms.join('|'), $options: 'i' } },
        { tags: { $in: searchTerms.map(t => new RegExp(t, 'i')) } },
      ],
    }

    // Get matching products
    const products = await Product.find(searchQuery)
      .populate('categoryHierarchy.mainCategory')
      .populate('categoryHierarchy.subCategory')
      .populate('categoryHierarchy.leafCategory')
      .populate('category')
      .limit(20)
      .lean()

    // Score products based on label matches
    return products
      .map(product => {
        let score = 0
        const productText = [product.name, product.description, ...(product.tags || [])]
          .join(' ')
          .toLowerCase()

        labels.forEach(({ label, confidence }) => {
          if (productText.includes(label.toLowerCase())) {
            score += confidence
          }
        })

        return {
          ...product,
          similarityScore: score,
        }
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
  } catch (error) {
    console.error('Error finding products:', error)
    return []
  }
}

const visualSearch = async req => {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      )
    }

    // Log request
    requestLog.set(`${ip}-${Date.now()}`, Date.now())

    const { image } = await req.json()
    console.log('Received visual search request')

    if (!image) {
      return NextResponse.json({ success: false, message: 'No image provided' }, { status: 400 })
    }

    // Call Python visual search API
    console.log('Calling Python visual search API...')
    const response = await fetch('http://localhost:8000/api/visual-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: image,
        confidence_threshold: 0.3,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Visual search API error: ${error}`)
    }

    const labels = await response.json()

    if (!labels.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not classify image',
        },
        { status: 400 }
      )
    }

    console.log(
      'Image labels:',
      labels.map(l => `${l.label} (${l.confidence})`)
    )

    // Find similar products using labels
    console.log('Finding similar products...')
    const similarProducts = await findProductsByLabels(labels)

    return NextResponse.json({
      success: true,
      data: {
        products: similarProducts,
        labels: labels,
        message: similarProducts.length === 0 ? 'No similar products found' : undefined,
      },
    })
  } catch (error) {
    console.error('Visual search error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Visual search failed',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export const POST = visualSearch
export const dynamic = 'force-dynamic'
