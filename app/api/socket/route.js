import { NextResponse } from 'next/server'
import { Server } from 'socket.io'

// Prevent multiple Socket.IO servers in dev/hot-reload
if (!global.io) {
  console.log('Initializing Socket.IO server...')

  const io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
  })

  // --- Track connected sockets by userId to prevent duplicate connections ---
  const userSockets = {}

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)

    // Track userId if provided
    const userId = socket.handshake.query.userId
    if (userId) {
      // Disconnect previous socket for this userId if exists
      if (userSockets[userId]) {
        try {
          userSockets[userId].disconnect(true)
        } catch {}
      }
      userSockets[userId] = socket
    }

    // Join admin room if user is admin
    if (socket.handshake.query.role === 'admin') {
      socket.join('admin-room')
      console.log('Admin joined admin room:', socket.id)
    }

    // Handle order notifications
    socket.on('newOrder', order => {
      console.log('New order received:', order.orderId)

      // Broadcast to all clients
      io.emit('orderNotification', {
        ...order,
        timestamp: new Date(),
        type: 'order',
      })

      // Also emit to admin room specifically
      io.to('admin-room').emit('adminOrderNotification', {
        ...order,
        timestamp: new Date(),
        type: 'order',
      })
    })

    socket.on('disconnect', reason => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason)
      // Remove from userSockets if present
      if (userId && userSockets[userId] && userSockets[userId].id === socket.id) {
        delete userSockets[userId]
      }
    })

    socket.on('error', error => {
      console.error('Socket error:', error)
    })
  })

  global.io = io
}

export async function GET(req) {
  if (!global.io) {
    return NextResponse.json({ error: 'Socket.IO server not initialized' }, { status: 500 })
  }

  return NextResponse.json({
    status: 'Socket server initialized',
    path: '/api/socket',
    transports: ['websocket', 'polling'],
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
