import { NextResponse } from 'next/server'
import { getIO } from '../socket/route'

export async function GET(req) {
  try {
    const io = getIO()

    // Add admin-specific event handlers if not already added
    if (!io.hasListeners('newOrder')) {
      io.on('newOrder', order => {
        console.log('New order received:', order.orderId)
        io.emit('orderNotification', order)
      })
    }

    return NextResponse.json({ status: 'Admin socket handlers initialized' })
  } catch (error) {
    console.error('Admin socket initialization failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Export getIO for use in other admin routes
export { getIO }
