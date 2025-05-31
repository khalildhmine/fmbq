import { NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'

let io

export async function GET(req) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Socket.IO initialization requested')
  }

  // Initialize Socket.IO if not already done
  if (!io) {
    console.log('Initializing Socket.IO server...')

    // Create Socket.IO server
    io = new SocketIOServer({
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
    })

    // Basic connection handling
    io.on('connection', socket => {
      console.log('Client connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    // Store io instance globally
    global.io = io
  }

  return NextResponse.json({
    status: 'Socket server initialized',
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  })
}

// Export the io instance
export const getIO = () => {
  if (!io && !global.io) {
    throw new Error('Socket.IO not initialized')
  }
  return io || global.io
}

export const config = {
  api: {
    bodyParser: false,
  },
}
