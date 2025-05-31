import { NextResponse } from 'next/server'

// Simple health check for the WebSocket endpoint
export async function GET(req) {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        message: 'WebSocket endpoint accessible',
        time: new Date().toISOString(),
        note: 'This is just the HTTP endpoint. WebSocket connections must use Socket.io client',
        socketInitialized: !!global.io,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('WS endpoint error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        time: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
