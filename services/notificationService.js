'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const NotificationContext = createContext()

const STORAGE_KEY = 'dashboard_notifications'

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

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection...')

    const newSocket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://192.168.100.5:3000',
      SOCKET_CONFIG
    )

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
    })

    newSocket.on('connect_error', error => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('orderNotification', order => {
      console.log('Received order notification:', order)

      const newNotification = {
        id: `order-${order._id}-${Date.now()}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order.orderId} - ${order.totalPrice.toFixed(2)} MRU`,
        time: new Date().toISOString(),
        isRead: false,
        data: order,
      }

      setNotifications(prev => [newNotification, ...prev])

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received', {
          body: `Order #${order.orderId} - ${order.totalPrice.toFixed(2)} MRU`,
          icon: '/favicon.ico',
        })
      }

      // Play notification sound
      try {
        const audio = new Audio('/notification-sound.mp3')
        audio.volume = 0.5 // Set volume to 50%
        audio.play().catch(error => {
          console.warn('Audio playback failed:', error)
        })
      } catch (error) {
        console.warn('Audio creation failed:', error)
      }
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection...')
      if (newSocket) {
        newSocket.off('orderNotification')
        newSocket.close()
      }
    }
  }, [])

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(STORAGE_KEY)
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }, [notifications])

  const addNotification = useCallback(notification => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  const removeNotification = useCallback(id => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback(id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    socket,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
