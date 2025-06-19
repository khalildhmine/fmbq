import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

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
      autoConnect: true,
      withCredentials: true,
      ...options,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error)
      // Try to reconnect on connection error
      setTimeout(() => {
        socket?.connect()
      }, 1000)
    })

    socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason)
      // Reconnect on certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport error') {
        setTimeout(() => {
          socket?.connect()
        }, 1000)
      }
    })

    // Handle browser window focus/blur
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        if (socket && !socket.connected) {
          console.log('Window focused, reconnecting socket...')
          socket.connect()
        }
      })

      window.addEventListener('online', () => {
        if (socket && !socket.connected) {
          console.log('Network online, reconnecting socket...')
          socket.connect()
        }
      })
    }
  }

  return socket
}

export const getSocket = (): Socket => {
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

// Clean up event listeners
export const cleanupSocket = () => {
  if (socket) {
    socket.off('connect')
    socket.off('disconnect')
    socket.off('connect_error')
    socket.disconnect()
    socket = null
  }
}
