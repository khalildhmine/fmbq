import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'

export async function GET(request) {
  try {
    await connectToDatabase()
    const url = new URL(request.url)
    const cartId = url.pathname.split('/').pop()

    if (!cartId) {
      return new Response(JSON.stringify({ success: false, message: 'Cart ID is required' }), { status: 400 })
    }

    const cart = await AnonymousCart.findOne({ cartId })

    if (!cart) {
      return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 })
    }

    return new Response(JSON.stringify({ success: true, cart }), { status: 200 })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}