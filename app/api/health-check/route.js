import { NextResponse } from 'next/server'

// Simple health check endpoint to test API connectivity
export async function GET(req) {
  try {
    const socketStatus = global.io ? 'initialized' : 'not initialized'

    return NextResponse.json(
      {
        status: 'ok',
        time: new Date().toISOString(),
        server: 'c-shopping-api',
        environment: process.env.NODE_ENV || 'development',
        socket: socketStatus,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check error:', error)
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
