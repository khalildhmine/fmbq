import { NextResponse } from 'next/server'
import connectToDB from '@/database'
import Coupon from '@/models/coupon.model'

export async function POST(request) {
  try {
    await connectToDB()
    const { couponCode, totalAmount } = await request.json()

    if (!couponCode || !totalAmount) {
      return NextResponse.json(
        {
          error: 'Coupon code and total amount are required',
          status: 'error',
        },
        { status: 400 }
      )
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isValid: true,
      expiryDate: { $gt: new Date() },
    })

    if (!coupon) {
      return NextResponse.json(
        {
          error: 'Invalid or expired coupon code',
          status: 'error',
        },
        { status: 400 }
      )
    }

    // Calculate discount on the already discounted price
    const discountAmount = Math.round((totalAmount * coupon.discount) / 100)
    const discountedTotal = totalAmount - discountAmount

    console.log('Coupon calculation:', {
      originalAmount: totalAmount,
      discountPercentage: coupon.discount,
      discountAmount,
      finalPrice: discountedTotal,
    })

    return NextResponse.json({
      success: true,
      discount: coupon.discount,
      discountAmount,
      discountedTotal,
      message: `Applied ${coupon.discount}% discount`,
    })
  } catch (error) {
    console.error('Coupon application error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    )
  }
}
