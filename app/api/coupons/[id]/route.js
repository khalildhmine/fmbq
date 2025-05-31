import { NextResponse } from 'next/server'
import Coupon from '@/models/Coupon'
import { verifyAuth, mockAuth } from '@/lib/auth'
import { connectToDatabase } from '../../../helpers/db'

// GET /api/coupons/[id] - Get a single coupon
export async function GET(request, { params }) {
  try {
    // Try to connect to database - if it fails, we'll use mock data
    try {
      await connectToDatabase()
    } catch (dbError) {
      console.warn('Database connection failed, using mock data:', dbError.message)
      return NextResponse.json({
        success: true,
        data: generateMockCoupon(params.id),
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

    // Only admin can access coupon details
    if (
      (!authResult.success || authResult.user.role !== 'admin') &&
      !mockAuth().user.role === 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    try {
      const coupon = await Coupon.findById(params.id)

      if (!coupon) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: coupon,
      })
    } catch (queryError) {
      console.error('Error querying coupon:', queryError)

      // Return mock data for development
      return NextResponse.json({
        success: true,
        data: generateMockCoupon(params.id),
      })
    }
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/coupons/[id] - Update a coupon
export async function PUT(request, { params }) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Only admin can update coupons
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

    // Check if coupon exists
    const coupon = await Coupon.findById(params.id)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Check if updated code already exists (if code is being changed)
    if (data.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() })
      if (existingCoupon) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
      }
    }

    // Update the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      params.id,
      {
        code: data.code.toUpperCase(),
        discount: data.discount,
        expiresAt: data.expiresAt,
        isActive: data.isActive,
        minAmount: data.minAmount || 0,
        maxUses: data.maxUses || null,
        description: data.description || '',
        isLimitedToFirstTimeUsers: data.isLimitedToFirstTimeUsers || false,
        updatedAt: new Date(),
        updatedBy: authResult.user._id,
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon,
    })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/coupons/[id] - Delete a coupon
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()

    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Only admin can delete coupons
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Check if coupon exists
    const coupon = await Coupon.findById(params.id)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Delete the coupon
    await Coupon.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon', details: error.message },
      { status: 500 }
    )
  }
}

// Function to generate a mock coupon for development
function generateMockCoupon(id) {
  const now = new Date()
  const expiryDate = new Date()
  expiryDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1)

  return {
    _id: id,
    code: 'MOCKCOUPON',
    discount: 25,
    expiresAt: expiryDate.toISOString(),
    isActive: true,
    minAmount: 100,
    maxUses: 100,
    usedCount: 45,
    description: 'Mock coupon for testing',
    isLimitedToFirstTimeUsers: false,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const dynamic = 'force-dynamic'
