import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'

export async function POST(request) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const { userId, cartId, contactInfo, items, totalItems, totalPrice, action } = body

    // Optional: Validate phone is string if present
    if (contactInfo?.phone && typeof contactInfo.phone !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'contactInfo.phone must be a string' }),
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Items are required' }), { status: 400 })
    }

    // Create new cart document every time
    let cartIdToUse = cartId

    if (!cartIdToUse) {
      cartIdToUse = userId || Math.random().toString(36).substr(2, 9)
    }

    const newCart = new AnonymousCart({
      userId: userId || null,
      cartId: cartId || userId || Math.random().toString(36).substr(2, 9),
      contactInfo: contactInfo || {},
      items,
      totalItems: totalItems || items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalPrice: totalPrice || items.reduce((sum, item) => sum + ((item.finalPrice || item.price || 0) * (item.quantity || 0)), 0),
      action: action || 'add',  // <-- Save action here
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newCart.save()

    return new Response(JSON.stringify({ success: true, cart: newCart }), { status: 201 })
  } catch (error) {
    console.error('Error saving cart:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}
