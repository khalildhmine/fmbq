import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Eye, X, ShoppingCart, User, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

/**
 * NotificationSystem - Real-time notification component for admin dashboard
 * Tracks new orders, users, and other important events
 */
const NotificationSystem = () => {
  // State for notifications
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState(Date.now())
  const socketRef = useRef(null)
  const router = useRouter()

  // Audio for notification sound
  const notificationSoundRef = useRef(null)

  // Load notification sound
  useEffect(() => {
    try {
      notificationSoundRef.current = new Audio('/notification-sound.mp3')
    } catch (error) {
      console.error('Failed to load notification sound:', error)
    }
  }, [])

  // Functions to manage notifications
  const addNotification = (type, title, message, data = {}) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Play sound for new notification
    if (notificationSoundRef.current) {
      // Clone the audio to allow multiple overlapping sounds
      const sound = notificationSoundRef.current.cloneNode()
      sound.volume = 0.7
      sound.play().catch(err => console.error('Error playing sound:', err))
    }

    // Show toast notification
    toast.custom(
      t => (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-gray-700 flex items-start gap-3 max-w-md cursor-pointer"
          onClick={() => {
            toast.dismiss(t.id)
            if (type === 'order' && data.orderId) {
              router.push(`/admin/orders/${data.orderId}`)
            }
          }}
        >
          <div className={`w-2 h-full rounded-full ${getTypeColor(type)}`}></div>
          <div className="flex-1">
            <div className="font-medium">{safeString(title)}</div>
            <div className="text-sm text-gray-300 mt-1">{safeString(message)}</div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation()
              toast.dismiss(t.id)
            }}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </motion.div>
      ),
      { duration: 5000 }
    )

    return newNotification.id
  }

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )

    updateUnreadCount()
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const updateUnreadCount = () => {
    const unread = notifications.filter(notification => !notification.read).length
    setUnreadCount(unread)
  }

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    updateUnreadCount()
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Function to get color based on notification type
  const getTypeColor = type => {
    switch (type) {
      case 'order':
        return 'bg-blue-500'
      case 'user':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get icon based on notification type
  const getTypeIcon = type => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={18} />
      case 'user':
        return <User size={18} />
      case 'error':
      case 'warning':
        return <AlertTriangle size={18} />
      default:
        return <Bell size={18} />
    }
  }

  // Helper to safely stringify any value for rendering
  const safeString = value => {
    if (value === null || value === undefined) {
      return ''
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value)
      } catch (err) {
        return '[Object]'
      }
    }
    return String(value)
  }

  // Connect to WebSocket
  useEffect(() => {
    const setupSocket = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid SSR issues
          const socketio = await import('socket.io-client')
          const socket = socketio.io('', {
            path: '/api/ws',
            transports: ['websocket'],
          })

          // Join admin room
          socket.emit('join_admin_room')
          console.log('Joined admin notification room')

          // Listen for new order events
          socket.on('new_order', orderData => {
            console.log('New order received via WebSocket:', orderData)

            // Make sure all data is properly stringified
            const safeOrderData = {
              ...orderData,
              _id: String(orderData._id || ''),
              orderId: String(orderData.orderId || ''),
              total: Number(orderData.total || 0),
            }

            addNotification(
              'order',
              'New Order Received',
              `Order #${safeOrderData.orderId} has been placed for $${safeOrderData.total.toFixed(
                2
              )}`,
              { orderId: safeOrderData._id }
            )
          })

          socket.on('connect', () => {
            console.log('WebSocket connected for admin notifications')
          })

          socket.on('disconnect', () => {
            console.log('WebSocket disconnected')
          })

          socket.on('error', error => {
            console.error('WebSocket error:', error)
          })

          socketRef.current = socket
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
      }
    }

    setupSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [router])

  // Poll for new orders/users as a fallback
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Check for new orders with admin=true to get correct results
        const ordersResponse = await fetch(`/api/orders?since=${lastCheckTime}&admin=true`, {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header with a properly formatted token
            Authorization: 'Bearer admin_session_token',
          },
        })
        const newOrdersData = await ordersResponse.json()

        console.log('Polling check for new orders:', newOrdersData)

        // Add notifications for new orders
        if (newOrdersData?.data?.newOrders > 0) {
          addNotification(
            'order',
            'New Order',
            `${newOrdersData.data.newOrders} new order(s) received.`,
            { count: newOrdersData.data.newOrders }
          )
        }

        // Update the last check time
        setLastCheckTime(Date.now())
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }

    // Initial check when component mounts
    checkForUpdates()

    // Set up polling interval - reduce frequency to prevent overwhelming the server
    const intervalId = setInterval(checkForUpdates, 30000) // Check every 30 seconds instead of 15

    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [lastCheckTime])

  // Handle notification click for orders
  const handleNotificationClick = notification => {
    markAsRead(notification.id)

    // Navigate based on notification type
    if (notification.type === 'order') {
      if (notification.data.orderId) {
        router.push(`/admin/orders/${notification.data.orderId}`)
      } else {
        router.push('/admin/orders')
      }
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
          >
            {/* Notification Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-medium text-gray-800">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center gap-1"
                  >
                    <Check size={12} />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto bg-white">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${getTypeColor(
                          notification.type
                        )} flex items-center justify-center text-white`}
                      >
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 flex items-center justify-between">
                          {safeString(notification.title)}
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {safeString(notification.message)}
                        </div>
                        {notification.data && Object.keys(notification.data).length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {Object.entries(notification.data).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {safeString(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationSystem
