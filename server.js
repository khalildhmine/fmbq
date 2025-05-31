const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)

    // Handle Socket.IO path specifically
    if (parsedUrl.pathname.startsWith('/api/socketio')) {
      res.statusCode = 500
      res.end('Socket.IO path handled internally')
      return
    }

    handle(req, res, parsedUrl)
  })

  // Initialize Socket.IO with proper path
  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  })

  // Store io instance globally
  global.io = io

  // Basic Socket.IO connection handling
  io.on('connection', socket => {
    console.log('Client connected:', socket.id)

    socket.on('error', error => {
      console.error('Socket error:', error)
    })

    socket.on('disconnect', reason => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason)
    })

    // Handle new order notifications
    socket.on('newOrder', order => {
      console.log('New order received:', order.orderId)
      io.emit('orderNotification', order)
    })
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
    console.log('> Socket.IO server initialized on /api/socketio')
  })
})
