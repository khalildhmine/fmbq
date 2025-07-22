const { Server } = require('socket.io')

let io

function initSocketIO(existingServer) {
  // Only initialize once
  if (global.io) {
    return global.io
  }

  try {
    io = new Server(existingServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    // Store in global for reuse
    global.io = io

    // Set up basic connection handler
    io.on('connection', socket => {
      console.log('Client connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    return io
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error)
    return null
  }
}

module.exports = {
  initSocketIO,
  getIO: () => io,
}
