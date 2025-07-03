import { NextResponse } from 'next/server'
import { Server } from 'socket.io'

// Improved Socket.IO initialization
let io

// Only initialize in server environment
if (typeof global !== 'undefined' && !global.io) {
  try {
    // Create a dummy HTTP server for Socket.IO
    const { createServer } = require('http')
    const httpServer = createServer()
    
    global.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })
    
    // Start listening on a different port than Next.js
    const PORT = process.env.SOCKET_PORT || 3001
    httpServer.listen(PORT, () => {
      console.log(`Socket.IO server running on port ${PORT}`)
    })
    
    io = global.io
    
    // Set up basic connection handler
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error)
  }
}

export async function GET(req) {
  if (!global.io) {
    return NextResponse.json(
      { success: false, message: 'Socket.IO server not initialized' },
      { status: 500 }
    )
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Socket.IO server is running',
    status: 'active'
  })
}

export const dynamic = 'force-dynamic'
