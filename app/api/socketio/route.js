import { NextResponse } from 'next/server'

export async function GET(req) {
  // We can't directly import using require here, so we use dynamic import
  const { getIO } = await import('../../../lib/socketio.js')
  const io = getIO()

  if (!io) {
    return NextResponse.json(
      { success: false, message: 'Socket.IO server not initialized' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Socket.IO server is running',
    status: 'active',
  })
}

export const dynamic = 'force-dynamic'
