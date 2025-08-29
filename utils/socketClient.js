import { io } from 'socket.io-client'

let socket = null

const SOCKET_CONFIG = {
  path: '/api/socketio',
  addTrailingSlash: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  forceNew: true,
  autoConnect: true,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
}

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://192.168.100.5:3000', SOCKET_CONFIG)

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
