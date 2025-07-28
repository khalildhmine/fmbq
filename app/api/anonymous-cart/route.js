import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'

export async function POST(request) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const { cartId, items, totalItems, totalPrice } = body

    if (!cartId) {
      return new Response(JSON.stringify({ success: false, message: 'Cart ID is required' }), {
        status: 400,
      })
    }

    const cart = await AnonymousCart.findOneAndUpdate(
      { cartId },
      {
        $set: {
          items,
          totalItems,
          totalPrice,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    )

    return new Response(JSON.stringify({ success: true, cart }), { status: 200 })
  } catch (error) {
    console.error('Anonymous cart error:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectToDatabase()
    const carts = await AnonymousCart.find().sort({ updatedAt: -1 })
    return new Response(JSON.stringify({ success: true, carts }), { status: 200 })
  } catch (error) {
    console.error('Error fetching carts:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}

// DELETE endpoint to remove an anonymous cart
export async function DELETE(request) {
  try {
    // Extract cart ID from URL
    const url = new URL(request.url)
    const cartId = url.searchParams.get('id')

    if (!cartId) {
      return NextResponse.json({ success: false, message: 'Cart ID is required' }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Delete the cart
    const result = await AnonymousCart.deleteOne({ cartId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Cart deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting anonymous cart:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete cart', error: error.message },
      { status: 500 }
    )
  }
}
