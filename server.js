const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  })

  // Socket.IO event handlers
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

  // Make io available globally
  global.io = io

  // Start server
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
