import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json()
    const { cartId, email, phone } = body

    if (!cartId || (!email && !phone)) {
      return NextResponse.json(
        { success: false, message: 'Cart ID and either email or phone are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find the cart
    const cart = await AnonymousCart.findOne({ cartId })

    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      )
    }

    // Update contact info
    cart.contactInfo = {
      email: email || null,
      phone: phone || null,
    }
    cart.hasOptedIn = true
    cart.optInDate = new Date()
    cart.reminderSent = false

    await cart.save()

    return NextResponse.json({
      success: true,
      message: 'Contact information saved successfully',
      data: cart,
    })
  } catch (error) {
    console.error('Error saving contact information:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save contact information', error: error.message },
      { status: 500 }
    )
  }
}