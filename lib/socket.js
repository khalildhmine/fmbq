import { io } from 'socket.io-client'

let socket = null

export const initSocket = (options = {}) => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin

    socket = io(socketUrl, {
      path: '/api/socket',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      ...options,
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
    throw new Error('Socket not initialized. Call initSocket() first.')
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
