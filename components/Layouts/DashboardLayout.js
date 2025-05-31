'use client'

import { useState, useEffect } from 'react'
import { Bell, Menu, Search, Settings, X } from 'lucide-react'
import Link from 'next/link'
import DashboardAside from '../DashboardAside'
import { useNotifications } from '../../services/notificationService'
import { initSocket } from '../../utils/socketClient'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { notifications, markAsRead, markAllAsRead, removeNotification, addNotification } =
    useNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Initialize socket connection
  useEffect(() => {
    const socket = initSocket()

    // Listen for order notifications
    socket.on('orderNotification', order => {
      console.log('Received order notification:', order)

      // Create notification object
      const notification = {
        id: `order-${order._id}-${Date.now()}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order.orderId} has been placed - ${order.totalPrice.toFixed(2)}`,
        time: new Date().toISOString(),
        isRead: false,
        data: order,
      }

      // Add notification
      addNotification(notification)

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Order Received', {
          body: `Order #${order.orderId} has been placed - ${order.totalPrice.toFixed(2)}`,
          icon: '/favicon.ico',
        })
      }
    })

    // Cleanup socket listeners on unmount
    return () => {
      socket.off('orderNotification')
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
                <span className="text-xl font-bold text-red-500">F & B</span>
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
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
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
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-75 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
      {/* Main content area */}
      <div className="pt-16 transition-all duration-300 bg-white ml-10">
        <div className="max-w-8xl mx-auto">
          <div className="lg:flex">
            {/* Mobile sidebar */}
            {mobileSidebarOpen && (
              <div className="fixed inset-y-0 left-0 z-30 w-72 lg:hidden">
                <div className="h-full">
                  <DashboardAside isCollapsed={false} onToggle={handleToggleSidebar} />
                </div>
              </div>
            )}

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
      `}</style>
    </div>
  )
}
