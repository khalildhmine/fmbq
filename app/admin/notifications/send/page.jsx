'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SendNotification() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'all', // all, specific
    userIds: [], // for specific users
    link: '', // optional link to product/category/etc
    scheduledFor: '', // optional scheduled time
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify the user's authentication status
        const response = await fetch('/api/auth/user')
        const data = await response.json()

        if (!response.ok || !data.success || data.data?.role !== 'admin') {
          router.replace('/login')
          return
        }

        setIsAuthenticated(true)
      } catch (err) {
        console.error('Auth check failed:', err)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setFormData({
          title: '',
          message: '',
          type: 'all',
          userIds: [],
          link: '',
          scheduledFor: '',
        })
      } else {
        if (response.status === 401) {
          router.replace('/login')
          return
        }
        throw new Error(data.error || data.message || 'Failed to send notification')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Send Notification</h1>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
          Notification sent successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            required
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Notification message"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="specific">Specific Users</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Link (Optional)</label>
          <input
            type="text"
            value={formData.link}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule For (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={e => setFormData({ ...formData, scheduledFor: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  )
}
