'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function NotificationHistory() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get token from localStorage
        const storedToken = localStorage.getItem('token')
        if (!storedToken) {
          console.log('No token found, redirecting to login')
          router.push('/login')
          return
        }

        // Set token in cookie for middleware
        document.cookie = `token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

        // Verify token is valid by making a test request
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (!response.ok) {
          console.log('Token verification failed, redirecting to login')
          localStorage.removeItem('token')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.push('/login')
          return
        }

        const data = await response.json()
        if (!data.isAdmin) {
          console.log('User is not an admin, redirecting')
          router.push('/')
          return
        }

        setToken(storedToken)
        setInitialized(true)
        fetchNotifications(storedToken)
      } catch (err) {
        console.error('Auth initialization error:', err)
        router.push('/login')
      }
    }

    initializeAuth()
  }, [router])

  const fetchNotifications = async authToken => {
    try {
      if (!authToken) {
        throw new Error('You must be logged in to view notifications')
      }

      console.log('Fetching notifications with token')
      const response = await fetch('/api/admin/notifications/history', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: 'include', // Include cookies in the request
      })

      const data = await response.json()
      console.log('Notifications API response:', data)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.push('/login')
          throw new Error('Please log in again to continue')
        }
        throw new Error(data.message || 'Failed to fetch notifications')
      }

      setNotifications(data.data.notifications)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
      if (err.message.includes('must be logged in') || err.message.includes('Authorization')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!initialized || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">
            {initialized ? 'Loading notifications...' : 'Verifying authentication...'}
          </span>
        </div>
        {initialized && (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-24 rounded"></div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Notification History</h1>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications sent yet.</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="mt-1 text-gray-600">{notification.message}</p>
                  {notification.link && (
                    <a
                      href={notification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                    >
                      View Link
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : notification.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : notification.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notification.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Sent to: {notification.type === 'all' ? 'All Users' : 'Specific Users'}
                {notification.successCount !== undefined && (
                  <span className="ml-2">
                    ({notification.successCount} delivered
                    {notification.failureCount > 0 && `, ${notification.failureCount} failed`})
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
