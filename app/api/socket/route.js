import { NextResponse } from 'next/server'
import { Server } from 'socket.io'

let io

if (!global.io) {
  console.log('Initializing Socket.IO server...')

  io = new Server({
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

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)

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
