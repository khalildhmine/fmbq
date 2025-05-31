'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import io from 'socket.io-client'
import axios from 'axios'

const API_URL = 'http://localhost:3000'
const SOCKET_CONFIG = {
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 20000,
}

// Mock socket implementation as fallback
const createMockSocket = () => {
  const listeners = {}
  const messageHistory = []

  const mockSocket = {
    // Keep track of all event listeners
    on: (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = []
      }
      listeners[event].push(callback)
      console.log(`[MockSocket] Added listener for ${event}`)
      return mockSocket
    },

    // Remove specific listener
    off: (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback)
        console.log(`[MockSocket] Removed listener for ${event}`)
      }
      return mockSocket
    },

    // Emit event to server (in mock, we just log it)
    emit: (event, data) => {
      console.log(`[MockSocket] Emitted ${event}:`, data)

      // For chat messages, we can mock the server echoing back
      if (event === 'send_message') {
        // Store in message history
        messageHistory.push(data)

        // Wait a bit to simulate network delay
        setTimeout(() => {
          if (listeners['chat_message']) {
            listeners['chat_message'].forEach(callback => {
              callback(data)
            })
          }
        }, 300)
      }

      return mockSocket
    },

    // Simulate receiving an event
    mockReceive: (event, data) => {
      if (listeners[event]) {
        listeners[event].forEach(callback => {
          callback(data)
        })
      }
    },

    // Mock disconnect
    disconnect: () => {
      console.log('[MockSocket] Disconnected')
    },

    // Mock reconnect
    connect: () => {
      if (listeners['connect']) {
        listeners['connect'].forEach(callback => callback())
      }
      console.log('[MockSocket] Connected')
    },

    // Last 10 messages for polling simulation
    getLastMessages: () => {
      return messageHistory.slice(-10)
    },

    connected: true,
    id: 'mock-socket-id',
  }

  return mockSocket
}

const useSocket = (roomId, userId) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [usingHttpFallback, setUsingHttpFallback] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const pollIntervalRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const lastMessageIdRef = useRef(null)
  const connectionTimerRef = useRef(null)
  const socketRef = useRef(null)

  // Enhanced version with heartbeats and improved reconnection
  const connectSocket = useCallback(() => {
    if (!roomId && !userId) {
      console.log('🔌 Cannot connect socket without roomId or userId')
      return
    }

    console.log('🔌 Attempting to connect to socket server...')
    setConnectionAttempts(prev => prev + 1)

    // Clear existing timers
    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current)
    }

    // We'll configure with more aggressive reconnection
    const socketInstance = io(`${API_URL}`, {
      query: { roomId, userId },
      reconnectionAttempts: 15, // Increased from 10
      reconnectionDelay: 1000, // Start with shorter delay
      reconnectionDelayMax: 8000, // Don't wait too long between attempts
      randomizationFactor: 0.3, // Less randomization for more predictable behavior
      timeout: 15000, // Balance between speed and reliability
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      autoConnect: true,
      forceNew: connectionAttempts > 3, // Force new connection if we've tried several times
    })

    socketRef.current = socketInstance

    // Set up a heartbeat to detect silent disconnections
    const heartbeatInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('heartbeat', { timestamp: Date.now() })
      } else if (reconnectAttemptsRef.current < 15) {
        console.log('💔 Heartbeat detected socket is not connected, attempting reconnect')
        socketInstance.connect()
        reconnectAttemptsRef.current += 1
      } else {
        console.log('💔 Heartbeat max reconnects reached, switching to HTTP fallback')
        setUsingHttpFallback(true)
        startPolling()
      }
    }, 10000) // Check every 10 seconds

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully')
      setConnected(true)
      setError(null)
      reconnectAttemptsRef.current = 0
      setConnectionAttempts(0)

      // If we were using HTTP fallback, we can stop
      if (usingHttpFallback) {
        stopPolling()
        setUsingHttpFallback(false)
      }

      // Join rooms/channels as needed
      if (roomId) {
        socketInstance.emit('join', { roomId, userId })
      }
    })

    socketInstance.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason)
      setConnected(false)

      // If disconnected due to server problems, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Set a timer to attempt reconnection
        connectionTimerRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect after server disconnect')
          socketInstance.connect()
        }, 2000)
      }
    })

    socketInstance.on('error', err => {
      console.error('🛑 Socket error:', err)
      setError(err)

      // If we've exceeded reconnection attempts, enable HTTP fallback
      if (reconnectAttemptsRef.current >= 15) {
        console.log('⚠️ Max reconnection attempts reached, switching to HTTP fallback')
        setUsingHttpFallback(true)
        startPolling()
      } else {
        reconnectAttemptsRef.current += 1
      }
    })

    socketInstance.on('reconnect_attempt', attempt => {
      console.log(`🔄 Reconnection attempt: ${attempt}`)
      reconnectAttemptsRef.current = attempt
    })

    socketInstance.on('reconnect_failed', () => {
      console.log('⚠️ Socket reconnection failed, switching to HTTP fallback')
      setUsingHttpFallback(true)
      startPolling()
    })

    socketInstance.on('message', message => {
      console.log('📩 Received message via socket:', message)
      // Receiving a message is proof of a working connection
      setConnected(true)

      setMessages(prevMessages => {
        // Check if we already have this message
        if (prevMessages.some(m => m.id === message.id)) {
          return prevMessages
        }

        // Update lastMessageId for polling
        if (message.id && (!lastMessageIdRef.current || message.id > lastMessageIdRef.current)) {
          lastMessageIdRef.current = message.id
        }

        return [...prevMessages, message]
      })
    })

    setSocket(socketInstance)

    // Return cleanup function
    return () => {
      console.log('🔌 Cleaning up socket connection...')
      clearInterval(heartbeatInterval)
      if (connectionTimerRef.current) {
        clearTimeout(connectionTimerRef.current)
      }
      socketInstance.disconnect()
    }
  }, [roomId, userId, connectionAttempts, usingHttpFallback])

  // Create socket connection with reconnection logic
  useEffect(() => {
    const cleanup = connectSocket()

    // Set up a reconnection check that will run even if the socket library fails
    const reconnectTimer = setInterval(() => {
      const socketInstance = socketRef.current

      if (!socketInstance?.connected && !usingHttpFallback) {
        console.log('🔄 Reconnection check: Socket not connected, attempting reconnect')
        cleanup?.()
        connectSocket()
      }
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(reconnectTimer)
      cleanup?.()
    }
  }, [connectSocket, roomId, userId, usingHttpFallback])

  // HTTP fallback functions
  const fetchMessagesHttp = useCallback(async () => {
    if (!roomId) return

    try {
      const since = lastMessageIdRef.current ? `?since=${lastMessageIdRef.current}` : ''
      console.log(`🔄 Polling for messages since ID: ${lastMessageIdRef.current || 'beginning'}`)

      const response = await axios.get(`${API_URL}/api/support/messages/${roomId}${since}`)

      if (response.data && Array.isArray(response.data)) {
        console.log(`📥 Fetched ${response.data.length} messages via HTTP`)

        const newMessages = response.data.filter(msg => {
          // Filter out messages we already have
          return !messages.some(m => m.id === msg.id)
        })

        if (newMessages.length > 0) {
          console.log(`📨 Adding ${newMessages.length} new messages from HTTP polling`)

          // Update last message ID for future polling
          const maxId = Math.max(...newMessages.map(m => m.id))
          if (maxId && (!lastMessageIdRef.current || maxId > lastMessageIdRef.current)) {
            lastMessageIdRef.current = maxId
          }

          setMessages(prev => [...prev, ...newMessages])
        }
      }
    } catch (err) {
      console.error('❌ Error fetching messages via HTTP:', err)
    }
  }, [roomId, messages])

  const sendMessageHttp = useCallback(
    async messageContent => {
      if (!roomId || !userId) return false

      try {
        console.log('📤 Sending message via HTTP fallback')
        const response = await axios.post(`${API_URL}/api/support/message`, {
          roomId,
          userId,
          content: messageContent,
          timestamp: new Date().toISOString(),
        })

        if (response.data && response.data.success) {
          console.log('✅ Message sent successfully via HTTP')

          // Add the message to our local state
          const sentMessage = response.data.message
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === sentMessage.id)) {
              return prev
            }
            return [...prev, sentMessage]
          })

          // Update lastMessageId if needed
          if (
            sentMessage.id &&
            (!lastMessageIdRef.current || sentMessage.id > lastMessageIdRef.current)
          ) {
            lastMessageIdRef.current = sentMessage.id
          }

          return true
        }
        return false
      } catch (err) {
        console.error('❌ Error sending message via HTTP:', err)
        return false
      }
    },
    [roomId, userId]
  )

  // Start polling for messages as HTTP fallback
  const startPolling = useCallback(() => {
    if (isPolling) return

    console.log('🔄 Starting HTTP polling for messages (every 30 seconds)')
    setIsPolling(true)

    // Initial fetch
    fetchMessagesHttp()

    // Set up interval for polling
    pollIntervalRef.current = setInterval(() => {
      fetchMessagesHttp()
    }, 30000) // Poll every 30 seconds
  }, [fetchMessagesHttp, isPolling])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      console.log('⏹️ Stopping HTTP polling')
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
      setIsPolling(false)
    }
  }, [])

  // Main function to send a message, will use socket or HTTP based on connection status
  const sendMessage = useCallback(
    async messageContent => {
      if (!messageContent || !roomId || !userId) return false

      if (connected && socket && !usingHttpFallback) {
        try {
          console.log('📤 Sending message via socket')
          socket.emit('message', {
            roomId,
            userId,
            content: messageContent,
            timestamp: new Date().toISOString(),
          })
          return true
        } catch (err) {
          console.error('❌ Error sending message via socket:', err)
          // Try HTTP fallback on socket failure
          return sendMessageHttp(messageContent)
        }
      } else {
        // If we're in HTTP fallback mode or socket is not connected
        return sendMessageHttp(messageContent)
      }
    },
    [socket, connected, usingHttpFallback, sendMessageHttp, roomId, userId]
  )

  // Function to manually toggle HTTP fallback mode
  const toggleHttpFallback = useCallback(() => {
    setUsingHttpFallback(prev => {
      const newValue = !prev
      console.log('🔄 Manually toggled HTTP fallback mode:', newValue)

      if (newValue) {
        startPolling()
      } else if (socket && socket.connected) {
        stopPolling()
      }

      return newValue
    })
  }, [startPolling, stopPolling, socket])

  return {
    socket,
    connected,
    sendMessage,
    messages,
    usingHttpFallback,
    toggleHttpFallback,
    error,
    fetchMessages: fetchMessagesHttp,
    startPolling,
    stopPolling,
  }
}

export default useSocket
