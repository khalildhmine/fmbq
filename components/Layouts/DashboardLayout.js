'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Menu, Search, Settings, X } from 'lucide-react'
import Link from 'next/link'
import DashboardAside from '../DashboardAside'
import { useNotifications } from '../../services/notificationService'
import { initSocket } from '@/lib/socket'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isNewNotification, setIsNewNotification] = useState(false)
  const notificationSoundRef = useRef(null)
  const socketRef = useRef(null)
  const { notifications, markAsRead, markAllAsRead, removeNotification, addNotification } =
    useNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Initialize notification sound
  useEffect(() => {
    const initializeSound = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext
        const audioContext = new AudioContext()

        // Load notification sound
        const sound = new Audio('/notification-sound.mp3')
        sound.volume = 0.7

        // Add error handling
        sound.onerror = error => {
          console.error('Error loading notification sound:', error)
        }

        // Load and test sound
        await sound.load()
        notificationSoundRef.current = sound

        // Test sound on load (muted)
        const testPlay = async () => {
          try {
            notificationSoundRef.current.muted = true
            await notificationSoundRef.current.play()
            notificationSoundRef.current.muted = false
            console.log('Notification sound initialized successfully')
          } catch (error) {
            console.warn('Sound test failed:', error)
          }
        }
        testPlay()
      } catch (error) {
        console.error('Failed to initialize notification sound:', error)
      }
    }

    initializeSound()

    // Cleanup
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause()
        notificationSoundRef.current = null
      }
    }
  }, [])

  // Initialize socket connection with reconnection logic
  useEffect(() => {
    const initializeSocket = () => {
      try {
        const socket = initSocket({
          query: { role: 'admin' },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
        socketRef.current = socket

        // Listen for order notifications
        socket.on('orderNotification', order => {
          console.log('Received order notification:', order)

          // Create notification object
          const notification = {
            id: `order-${order._id}-${Date.now()}`,
            type: 'order',
            title: 'New Order Received! 🛍️',
            message: `Order #${order.orderId} - ${order.totalPrice.toFixed(2)} MRU\nCustomer: ${order.customer?.name || 'Customer'}\nLocation: ${order.shippingAddress?.city || 'N/A'}`,
            time: new Date().toISOString(),
            isRead: false,
            data: order,
          }

          // Add notification
          addNotification(notification)

          // Play notification sound with retry
          const playSound = async (retries = 3) => {
            try {
              if (notificationSoundRef.current) {
                notificationSoundRef.current.currentTime = 0 // Reset to start
                await notificationSoundRef.current.play()
              } else {
                throw new Error('Notification sound not initialized')
              }
            } catch (error) {
              console.warn('Could not play notification sound:', error)
              if (retries > 0) {
                console.log(`Retrying sound playback... (${retries} attempts left)`)
                setTimeout(() => playSound(retries - 1), 500)
              }
            }
          }

          // Start sound playback
          playSound()

          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('New Order Received! 🛍️', {
              body: `Order #${order.orderId} - ${order.totalPrice.toFixed(2)} MRU\nCustomer: ${order.customer?.name || 'Customer'}\nLocation: ${order.shippingAddress?.city || 'N/A'}`,
              icon: '/favicon.ico',
              silent: true, // We'll handle the sound ourselves
            })
          }
        })

        // Handle socket disconnection
        socket.on('disconnect', reason => {
          console.log('Socket disconnected:', reason)
          if (reason === 'io server disconnect' || reason === 'transport error') {
            // Reconnect if the disconnection wasn't initiated by the client
            setTimeout(() => {
              console.log('Attempting to reconnect socket...')
              socket.connect()
            }, 1000)
          }
        })

        // Handle socket connection error
        socket.on('connect_error', error => {
          console.error('Socket connection error:', error)
          // Attempt to reconnect
          setTimeout(() => {
            console.log('Attempting to reconnect socket after error...')
            socket.connect()
          }, 1000)
        })

        return socket
      } catch (error) {
        console.error('Failed to initialize socket:', error)
        // Retry initialization after delay
        setTimeout(initializeSocket, 2000)
      }
    }

    const socket = initializeSocket()

    // Cleanup socket listeners on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('orderNotification')
        socketRef.current.off('disconnect')
        socketRef.current.off('connect_error')
        socketRef.current.disconnect()
      }
    }
  }, [addNotification])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission)
      })
    }
  }, [])

  const handleToggleSidebar = value => {
    setSidebarCollapsed(typeof value === 'boolean' ? value : !sidebarCollapsed)
  }

  const handleNotificationClick = notification => {
    markAsRead(notification.id)
    if (notification.type === 'order' && notification.data?._id) {
      router.push(`/admin/orders/${notification.data._id}`)
      setNotificationsOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="fixed w-full top-0 z-20">
        <div className="max-w-8xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 lg:px-6 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              <Link href="/admin" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-red-500">FORMEN & BQ</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  className={`p-2 hover:bg-gray-100 rounded-lg relative ${
                    isNewNotification ? 'animate-shake' : ''
                  }`}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell
                    className={`h-5 w-5 ${unreadCount > 0 ? 'text-red-500' : 'text-gray-600'}`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-xs text-white font-medium">{unreadCount}</span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-red-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {new Date(notification.time).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation()
                                      markAsRead(notification.id)
                                    }}
                                    className="text-xs text-red-500 hover:text-red-600"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {notification.type === 'order' && notification.data && (
                              <div className="mt-2 text-xs text-red-500 hover:text-red-600">
                                View Order Details →
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile backdrop */}
      {/* {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-75 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )} */}
      {/* Main content area */}
      <div className="pt-16 transition-all duration-300 bg-white ">
        <div className="max-w-8xl mx-auto">
          <div className="lg:flex">
            {/* Mobile sidebar */}
            {/* {mobileSidebarOpen && (
              <div className="fixed inset-y-0 left-0 z-30 w-72 lg:hidden">
                <div className="h-full">
                  <DashboardAside isCollapsed={false} onToggle={handleToggleSidebar} />
                </div>
              </div>
            )} */}

            {/* Desktop sidebar */}
            <div
              className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? 'w-20' : 'w-72'
              }`}
            >
              <DashboardAside isCollapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
            </div>

            {/* Main content */}
            <div className="flex-1 bg-white">
              <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Admin Footer */}
      {/* <footer className="bg-black border-t border-gray-800 py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} F & B. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 text-xs text-gray-500">
              Session timeout in{' '}
              {Math.round((sessionTimeout - (Date.now() - lastActivity)) / 60000)} minutes
            </div>
          </div>
        </div>
      </footer> */}
      {/* Click away listeners - Only render if either menu is open */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  )
}
