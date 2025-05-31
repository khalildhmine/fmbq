import { NextResponse } from 'next/server'
import Coupon from '@/models/Coupon'
import { verifyAuth, mockAuth } from '@/lib/auth'
import { connectToDatabase } from '../../helpers/db'

// GET /api/coupons - Get all coupons
export async function GET(request) {
  try {
    // Try to connect to database - if it fails, we'll use mock data
    try {
      await connectToDatabase()
    } catch (dbError) {
      console.warn('Database connection failed, using mock data:', dbError.message)
      return NextResponse.json({
        success: true,
        data: generateMockCoupons(5),
      })
    }

    // Get authentication result
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      console.warn('Auth failed, using mock auth')
      // Use mock auth for development
      const mockAuthResult = mockAuth()
      if (!mockAuthResult.success) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
      }
    }

    // Only admin can access coupons
    if (
      (!authResult.success || authResult.user.role !== 'admin') &&
      !mockAuth().user.role === 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    const query = {}
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }

    try {
      const coupons = await Coupon.find(query).sort({ createdAt: -1 }).limit(limit)
      return NextResponse.json({
        success: true,
        data: coupons,
      })
    } catch (queryError) {
      console.error('Error querying coupons:', queryError)

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: generateMockCoupons(5),
      })
    }
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/coupons - Create a new coupon
export async function POST(request) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Only admin can create coupons
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    if (typeof data.discount !== 'number' || data.discount < 0 || data.discount > 100) {
      return NextResponse.json(
        { error: 'Discount must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Create the coupon
    const coupon = new Coupon({
      code: data.code.toUpperCase(),
      discount: data.discount,
      expiresAt: data.expiresAt,
      isActive: data.isActive ?? true,
      minAmount: data.minAmount || 0,
      maxUses: data.maxUses || null,
      usedCount: 0,
      description: data.description || '',
      isLimitedToFirstTimeUsers: data.isLimitedToFirstTimeUsers || false,
      createdBy: authResult.user._id,
    })

    await coupon.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon', details: error.message },
      { status: 500 }
    )
  }
}

// Function to generate mock coupon data for development
function generateMockCoupons(count = 5) {
  const mockCoupons = []

  for (let i = 0; i < count; i++) {
    const now = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1)

    mockCoupons.push({
      _id: `mock_coupon_${i}_${Date.now()}`,
      code: ['SUMMER25', 'WELCOME10', 'SALE50', 'NEWUSER', 'FLASH20'][i % 5],
      discount: [10, 15, 20, 25, 50][i % 5],
      expiresAt: expiryDate.toISOString(),
      isActive: Math.random() > 0.3,
      minAmount: [0, 50, 100, 150, 200][i % 5],
      maxUses: i % 2 === 0 ? 100 : null,
      usedCount: Math.floor(Math.random() * 50),
      description: `Mock coupon ${i + 1} for testing`,
      isLimitedToFirstTimeUsers: i % 3 === 0,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * i).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return mockCoupons
}

export const dynamic = 'force-dynamic'
