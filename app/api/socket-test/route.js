import { NextResponse } from 'next/server'

// API endpoint to check socket.io server status
export async function GET(req) {
  try {
    // Check if Socket.io server is initialized
    const isSocketInitialized = !!global.io

    // Get connection stats if available
    let connectionStats = null
    if (isSocketInitialized) {
      const io = global.io
      // Get current socket server stats
      const sockets = await io.fetchSockets()

      connectionStats = {
        connectedClients: sockets.length,
        engine: io.engine?.opts?.EIO || 'unknown',
        serverTime: new Date().toISOString(),
      }
    }

    return NextResponse.json({
      status: 'ok',
      socketInitialized: isSocketInitialized,
      message: isSocketInitialized
        ? 'Socket.io server is running'
        : 'Socket.io server not initialized',
      stats: connectionStats,
      time: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Socket test error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        socketInitialized: false,
        time: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
