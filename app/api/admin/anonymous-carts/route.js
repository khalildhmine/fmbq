import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'

export async function GET() {
  try {
    await connectToDatabase()
    const carts = await AnonymousCart.find({}).sort({ updatedAt: -1 }).lean()
    return new Response(JSON.stringify({ success: true, carts }), { status: 200 })
  } catch (error) {
    console.error('Error fetching carts:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}
