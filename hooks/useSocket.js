// 'use client'

// import { useEffect, useState, useRef, useCallback } from 'react'
// import io from 'socket.io-client'
// import axios from 'axios'

// const API_URL =
//   typeof window !== 'undefined' && window.location.hostname === 'localhost'
//     ? 'http://localhost:3000'
//     : 'http://localhost:3000'

// // --- FIX: Add /api/socketio as the socket path for Next.js custom serverless socket route ---
// const SOCKET_CONFIG = {
//   transports: ['websocket'],
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 2000,
//   reconnectionDelayMax: 10000,
//   timeout: 30000,
//   autoConnect: true,
//   forceNew: false,
//   upgrade: false,
//   rememberUpgrade: true,
//   path: '/api/socketio', // <--- This is critical for Next.js API route!
// }

// const useSocket = (isAdmin = false, roomId = null, userId = null) => {
//   const [socket, setSocket] = useState(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [error, setError] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [connectionAttempts, setConnectionAttempts] = useState(0)

//   // Refs for cleanup and persistence
//   const socketRef = useRef(null)
//   const heartbeatIntervalRef = useRef(null)
//   const reconnectTimeoutRef = useRef(null)
//   const mountedRef = useRef(true)

//   // Clear all timers and intervals
//   const clearTimers = useCallback(() => {
//     if (heartbeatIntervalRef.current) {
//       clearInterval(heartbeatIntervalRef.current)
//       heartbeatIntervalRef.current = null
//     }
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current)
//       reconnectTimeoutRef.current = null
//     }
//   }, [])

//   // Enhanced connection function with proper error handling
//   const connectSocket = useCallback(() => {
//     if (!mountedRef.current) return

//     console.log('🔌 Initializing socket connection...')

//     // Clean up existing socket
//     if (socketRef.current) {
//       console.log('🧹 Cleaning up existing socket')
//       socketRef.current.removeAllListeners()
//       socketRef.current.disconnect()
//       socketRef.current = null
//     }

//     clearTimers()
//     setError(null)

//     try {
//       // --- FIX: Use API_URL and SOCKET_CONFIG with correct path ---
//       console.log('🚀 Creating new socket with config:', SOCKET_CONFIG)
//       const socketInstance = io(API_URL, SOCKET_CONFIG)
//       socketRef.current = socketInstance
//       setSocket(socketInstance)

//       // Connection successful
//       socketInstance.on('connect', () => {
//         if (!mountedRef.current) return

//         console.log('✅ Socket connected successfully')
//         console.log('🔗 Socket ID:', socketInstance.id)
//         console.log('🚗 Transport:', socketInstance.io?.engine?.transport?.name)

//         setIsConnected(true)
//         setError(null)
//         setConnectionAttempts(0)

//         // Join admin room if admin
//         if (isAdmin) {
//           console.log('👨‍💼 Joining admin room...')
//           socketInstance.emit('join_admin', {
//             userId: userId,
//             timestamp: Date.now(),
//           })
//         }
//         // Always join the chat room if roomId is present
//         if (roomId) {
//           socketInstance.emit('join_chat', { caseId: roomId })
//           console.log('[SOCKET][HOOK] join_chat emitted for room:', roomId)
//         }

//         // Start heartbeat to keep connection alive
//         heartbeatIntervalRef.current = setInterval(() => {
//           if (socketInstance.connected && mountedRef.current) {
//             console.log('💓 Sending heartbeat')
//             socketInstance.emit('heartbeat', {
//               timestamp: Date.now(),
//               userId: userId,
//               isAdmin: isAdmin,
//             })
//           }
//         }, 25000) // Send every 25 seconds
//       })

//       // Handle transport upgrade
//       socketInstance.io.on('upgrade', transport => {
//         console.log('⬆️ Transport upgraded to:', transport.name)
//       })

//       // Handle transport errors
//       socketInstance.io.on('upgrade_error', error => {
//         console.warn('⚠️ Transport upgrade error:', error)
//       })

//       // Handle disconnection
//       socketInstance.on('disconnect', reason => {
//         if (!mountedRef.current) return

//         console.log('❌ Socket disconnected:', reason)
//         setIsConnected(false)
//         clearTimers()

//         // Handle different disconnect reasons
//         if (reason === 'io server disconnect') {
//           console.log('🔄 Server initiated disconnect, reconnecting...')
//           // Server disconnected, need to reconnect manually
//           setTimeout(() => {
//             if (mountedRef.current) {
//               connectSocket()
//             }
//           }, 1000)
//         } else if (reason === 'io client disconnect') {
//           console.log('👤 Client initiated disconnect, not reconnecting')
//           // Client disconnected manually, don't reconnect
//         } else if (reason === 'transport error') {
//           console.log('🚨 Transport error, attempting immediate reconnect')
//           setConnectionAttempts(prev => prev + 1)
//           // Transport error, try reconnecting immediately
//           setTimeout(() => {
//             if (mountedRef.current) {
//               connectSocket()
//             }
//           }, 500)
//         } else {
//           console.log('🔄 Unexpected disconnect, reconnecting with delay')
//           setConnectionAttempts(prev => prev + 1)
//           // Other reasons, reconnect with delay
//           const delay = Math.min(2000 * Math.pow(1.5, connectionAttempts), 15000)
//           reconnectTimeoutRef.current = setTimeout(() => {
//             if (mountedRef.current) {
//               connectSocket()
//             }
//           }, delay)
//         }
//       })

//       // Handle connection errors
//       socketInstance.on('connect_error', err => {
//         if (!mountedRef.current) return

//         console.error('🚨 Connection error:', err.message)
//         console.error('🚨 Error details:', err)
//         setIsConnected(false)
//         setError(err.message)
//         setConnectionAttempts(prev => prev + 1)

//         // Retry connection with exponential backoff
//         const delay = Math.min(2000 * Math.pow(1.5, connectionAttempts), 30000)
//         console.log(`⏳ Retrying connection in ${delay}ms (attempt ${connectionAttempts + 1})`)

//         reconnectTimeoutRef.current = setTimeout(() => {
//           if (mountedRef.current) {
//             connectSocket()
//           }
//         }, delay)
//       })

//       // Handle reconnection
//       socketInstance.on('reconnect', attemptNumber => {
//         if (!mountedRef.current) return

//         console.log('🔄 Reconnected after', attemptNumber, 'attempts')
//         setIsConnected(true)
//         setError(null)
//         setConnectionAttempts(0)
//       })

//       // Handle reconnection attempts
//       socketInstance.on('reconnect_attempt', attemptNumber => {
//         console.log('🔄 Reconnection attempt:', attemptNumber)
//         setConnectionAttempts(attemptNumber)
//       })

//       // Handle reconnection errors
//       socketInstance.on('reconnect_error', error => {
//         console.error('🚨 Reconnection error:', error)
//         setError(`Reconnection failed: ${error.message}`)
//       })

//       // Handle reconnection failures
//       socketInstance.on('reconnect_failed', () => {
//         console.error('💀 All reconnection attempts failed')
//         setError('Connection failed - all retry attempts exhausted')
//         setIsConnected(false)
//       })

//       // Handle messages
//       socketInstance.on('message', message => {
//         if (!mountedRef.current) return

//         console.log('📩 Received message:', message)
//         setMessages(prevMessages => {
//           // Prevent duplicate messages
//           if (prevMessages.some(m => m.id === message.id || m._id === message._id)) {
//             return prevMessages
//           }
//           return [...prevMessages, message]
//         })
//       })

//       // Admin specific events
//       if (isAdmin) {
//         socketInstance.on('new_message', message => {
//           if (!mountedRef.current) return
//           console.log('📨 New admin message:', message)
//         })

//         socketInstance.on('new_chat', chatData => {
//           if (!mountedRef.current) return
//           console.log('💬 New chat:', chatData)
//         })

//         socketInstance.on('connection_status', data => {
//           if (!mountedRef.current) return
//           console.log('📊 Connection status:', data)
//           if (data.status === 'connected') {
//             setIsConnected(true)
//           }
//         })

//         // Handle admin room join confirmation
//         socketInstance.on('admin_joined', data => {
//           if (!mountedRef.current) return
//           console.log('✅ Admin room joined successfully:', data)
//         })
//       }
//     } catch (err) {
//       console.error('🚨 Socket initialization error:', err)
//       setError(err.message)
//       setIsConnected(false)

//       // Retry initialization after delay
//       setTimeout(() => {
//         if (mountedRef.current) {
//           connectSocket()
//         }
//       }, 5000)
//     }
//   }, [isAdmin, connectionAttempts, clearTimers, userId, roomId])

//   // Initialize connection on mount
//   useEffect(() => {
//     mountedRef.current = true
//     connectSocket()

//     // Cleanup on unmount
//     return () => {
//       mountedRef.current = false
//       clearTimers()
//       if (socketRef.current) {
//         socketRef.current.removeAllListeners()
//         socketRef.current.disconnect()
//       }
//     }
//   }, [connectSocket])

//   // Send message function with error handling
//   const sendMessage = useCallback(
//     async messageContent => {
//       if (!messageContent || !roomId || !userId) {
//         console.warn('⚠️ Missing required parameters for sending message')
//         return false
//       }

//       const socketInstance = socketRef.current

//       if (!socketInstance || !socketInstance.connected) {
//         console.error('❌ Socket not connected, cannot send message')
//         setError('Socket not connected')
//         return false
//       }

//       try {
//         const messageData = {
//           roomId,
//           userId,
//           content: messageContent,
//           timestamp: new Date().toISOString(),
//         }

//         console.log('📤 Sending message via socket:', messageData)

//         if (isAdmin) {
//           socketInstance.emit('admin_message', messageData)
//         } else {
//           socketInstance.emit('message', messageData)
//         }

//         return true
//       } catch (err) {
//         console.error('❌ Error sending message:', err)
//         setError(err.message)
//         return false
//       }
//     },
//     [roomId, userId, isAdmin]
//   )

//   // Manual reconnection function
//   const reconnect = useCallback(() => {
//     console.log('🔄 Manual reconnection triggered')
//     connectSocket()
//   }, [connectSocket])

//   // Get connection status with detailed info
//   const getConnectionStatus = useCallback(() => {
//     const socketInstance = socketRef.current
//     return {
//       isConnected: isConnected && socketInstance?.connected,
//       socketId: socketInstance?.id,
//       transport: socketInstance?.io?.engine?.transport?.name,
//       attempts: connectionAttempts,
//       error: error,
//     }
//   }, [isConnected, connectionAttempts, error])

//   return {
//     socket: socketRef.current,
//     isConnected: isConnected && socketRef.current?.connected,
//     sendMessage,
//     messages,
//     error,
//     connectionAttempts,
//     reconnect,
//     getConnectionStatus,
//   }
// }

// export default useSocket

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import io from 'socket.io-client'

const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'http://localhost:3000'

const SOCKET_CONFIG = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 30000,
  autoConnect: true,
  forceNew: false,
  upgrade: false,
  rememberUpgrade: true,
  path: '/api/socketio',
}

const useSocket = (isAdmin = false, roomId = null, userId = null) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  const socketRef = useRef(null)
  const heartbeatIntervalRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const mountedRef = useRef(true)

  const clearTimers = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connectSocket = useCallback(() => {
    if (!mountedRef.current) return

    console.log('🔌 Initializing socket connection...')
    if (socketRef.current) {
      console.log('🧹 Cleaning up existing socket')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    clearTimers()
    setError(null)

    try {
      const socketInstance = io(API_URL, SOCKET_CONFIG)
      socketRef.current = socketInstance
      setSocket(socketInstance)

      socketInstance.on('connect', () => {
        if (!mountedRef.current) return
        console.log('✅ Socket connected:', socketInstance.id)
        setIsConnected(true)
        setError(null)
        setConnectionAttempts(0)

        if (isAdmin) {
          socketInstance.emit('join_admin', { userId })
          console.log('[SOCKET][HOOK] Admin joined admin_room')
          if (roomId) {
            socketInstance.emit('join_chat', { caseId: roomId })
            console.log('[SOCKET][HOOK] Admin joined room:', roomId)
          }
        } else if (roomId) {
          socketInstance.emit('join_chat', { caseId: roomId })
          console.log('[SOCKET][HOOK] User joined room:', roomId)
        }

        heartbeatIntervalRef.current = setInterval(() => {
          if (socketInstance.connected && mountedRef.current) {
            socketInstance.emit('heartbeat', {
              timestamp: Date.now(),
              userId,
              isAdmin,
            })
          }
        }, 25000)
      })

      socketInstance.on('new_message', message => {
        if (!mountedRef.current) return
        console.log('[SOCKET][HOOK] Received new_message:', message)
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev
          return [...prev, message]
        })
      })

      // Enhanced socket event handling for chat acceptance
      socketInstance.on('chat_accepted', data => {
        console.log(`🔔 Chat accepted event received:`, data)

        // For admin clients, update their UI
        if (isAdmin) {
          console.log('Admin received chat_accepted event, updating UI')
        }
      })

      // Setup event handlers for broadcasting to clients
      if (isAdmin) {
        // When admin accepts a chat, broadcast to the specific chat room
        socketInstance.on('admin_accept_chat', data => {
          console.log(`🔔 Admin accepting chat:`, data)

          // Broadcast to all users in this chat room
          socketInstance.emit('chat_accepted', {
            chatId: data.chatId,
            adminId: data.adminId,
            adminName: data.adminName || 'Admin',
            timestamp: data.timestamp || new Date().toISOString(),
            status: 'active',
          })

          // Also emit a status update event for the mobile app
          socketInstance.emit('chat_status_change', {
            chatId: data.chatId,
            updates: {
              status: 'active',
              adminId: data.adminId,
              isLive: true,
              acceptedAt: data.timestamp || new Date().toISOString(),
            },
          })

          // Send a system message to notify users
          socketInstance.emit('new_message', {
            _id: `system-${Date.now()}`,
            chatId: data.chatId,
            content: `An admin has joined the chat and is ready to assist you.`,
            sender: {
              role: 'system',
              id: 'system',
              name: 'System',
            },
            timestamp: new Date().toISOString(),
          })
        })
      }

      socketInstance.on('chat_closed', data => {
        if (!mountedRef.current) return
        console.log('[SOCKET][HOOK] Chat closed:', data)
      })

      socketInstance.on('admin_joined', data => {
        if (!mountedRef.current) return
        console.log('[SOCKET][HOOK] Admin room joined:', data)
      })

      socketInstance.on('disconnect', reason => {
        if (!mountedRef.current) return
        console.log('❌ Socket disconnected:', reason)
        setIsConnected(false)
        clearTimers()

        const delay = Math.min(2000 * Math.pow(1.5, connectionAttempts), 15000)
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connectSocket()
          }
        }, delay)
      })

      socketInstance.on('connect_error', err => {
        if (!mountedRef.current) return
        console.error('🚨 Connection error:', err.message)
        setIsConnected(false)
        setError(err.message)
        setConnectionAttempts(prev => prev + 1)

        const delay = Math.min(2000 * Math.pow(1.5, connectionAttempts), 30000)
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connectSocket()
          }
        }, delay)
      })
    } catch (err) {
      console.error('🚨 Socket initialization error:', err)
      setError(err.message)
      setIsConnected(false)
      setTimeout(() => {
        if (mountedRef.current) {
          connectSocket()
        }
      }, 5000)
    }
  }, [isAdmin, roomId, userId, connectionAttempts, clearTimers])

  useEffect(() => {
    mountedRef.current = true
    connectSocket()
    return () => {
      mountedRef.current = false
      clearTimers()
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
      }
    }
  }, [connectSocket])

  const sendMessage = useCallback(
    async messageContent => {
      if (!messageContent || !roomId || !userId || !socketRef.current?.connected) {
        console.error('❌ Cannot send message: missing parameters or not connected')
        return false
      }

      const messageData = {
        content: messageContent,
        caseId: roomId,
        userId,
        sender: userId,
        type: isAdmin ? 'ADMIN' : 'USER',
        timestamp: new Date().toISOString(),
        _id: `${Date.now()}-${Math.random()}`, // Temporary ID
      }

      socketRef.current.emit('chat_message', messageData)
      setMessages(prev => [...prev, messageData]) // Optimistic update
      return true
    },
    [roomId, userId, isAdmin]
  )

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection triggered')
    connectSocket()
  }, [connectSocket])

  const getConnectionStatus = useCallback(() => {
    const socketInstance = socketRef.current
    return {
      isConnected: isConnected && socketInstance?.connected,
      socketId: socketInstance?.id,
      transport: socketInstance?.io?.engine?.transport?.name,
      attempts: connectionAttempts,
      error,
    }
  }, [isConnected, connectionAttempts, error])

  return {
    socket: socketRef.current,
    isConnected: isConnected && socketRef.current?.connected,
    sendMessage,
    messages,
    error,
    connectionAttempts,
    reconnect,
    getConnectionStatus,
  }
}

export default useSocket
