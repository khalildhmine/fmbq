import { Server as SocketIOServer } from 'socket.io'

export function initSocket(res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...')
    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('Client connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return res.socket.server.io
}
