import { NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import Coupon from '@/models/Coupon'

export async function POST(req) {
  try {
    await connectDb()

    const body = await req.json()
    console.log('Received coupon validation request:', body)

    // Handle both nested and flat structures
    const couponCode = body.couponCode || body.code?.couponCode
    const totalAmount = body.totalAmount || body.code?.totalAmount

    if (!couponCode) {
      console.log('No coupon code provided')
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
    console.log('Found coupon:', coupon)

    if (!coupon) {
      console.log('Coupon not found')
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      console.log('Coupon expired')
      return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 })
    }

    if (coupon.minPurchaseAmount && totalAmount < coupon.minPurchaseAmount) {
      console.log('Minimum purchase amount not met')
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`,
        },
        { status: 400 }
      )
    }

    const response = {
      success: true,
      discount: coupon.discount,
      code: coupon.code,
    }
    console.log('Returning successful response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
