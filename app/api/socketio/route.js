import { NextResponse } from 'next/server'

export async function GET(req) {
  // Check if Socket.IO is initialized
  const isInitialized = typeof global.io !== 'undefined'

  return NextResponse.json({
    status: isInitialized ? 'Socket.IO server is running' : 'Socket.IO server not initialized',
    initialized: isInitialized,
    path: '/api/socketio',
  })
}

export const dynamic = 'force-dynamic'
