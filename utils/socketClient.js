import { io } from 'socket.io-client'

let socket = null

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      addTrailingSlash: false,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error)
    })

    socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason)
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const emitClientEvent = (event, data) => {
  const socketInstance = getSocket()
  if (socketInstance) {
    socketInstance.emit(event, data)
    return true
  }
  return false
}
