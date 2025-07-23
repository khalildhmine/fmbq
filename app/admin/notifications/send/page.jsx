'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SendNotification() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'all',
    image: '',
  })
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/notifications/tokens')
      const data = await res.json()
      if (data.success && Array.isArray(data.tokens)) {
        setTokens(data.tokens)
      } else {
        setTokens([])
      }
    } catch (error) {
      setTokens([])
      console.error('Error fetching tokens:', error)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tokens: tokens
            .filter(token => {
              if (formData.type === 'all') return true
              if (formData.type === 'registered') return !!token.userId
              if (formData.type === 'anonymous') return !token.userId
              return false
            })
            .map(t => t.token),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully sent to ${data.sentCount} devices`,
        })
        setFormData({ title: '', body: '', type: 'all', image: '' })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send notification',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Send Notifications</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Users</label>
            <select
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Users ({tokens.length})</option>
              <option value="registered">
                Registered Users ({tokens.filter(t => t.userId).length})
              </option>
              <option value="anonymous">
                Anonymous Users ({tokens.filter(t => !t.userId).length})
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notification Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notification Message</label>
            <textarea
              value={formData.body}
              onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Enter notification message"
              className="w-full p-2 border rounded-md h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="Enter image URL"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Registered Tokens</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border">Token</th>
                <th className="p-3 text-left border">User Type</th>
                <th className="p-3 text-left border">User Details</th>
                <th className="p-3 text-left border">Device Info</th>
                <th className="p-3 text-left border">Last Active</th>
                <th className="p-3 text-left border">Status</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(token => (
                <tr key={token._id} className="border-t">
                  <td className="p-3 border text-sm truncate max-w-xs">{token.token}</td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        token.userId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {token.userId ? 'Registered' : 'Anonymous'}
                    </span>
                  </td>
                  <td className="p-3 border text-sm">
                    {token.userId && token.user ? (
                      <div>
                        <div>
                          <b>Name:</b> {token.user.name || '-'}
                        </div>
                        <div>
                          <b>Email:</b> {token.user.email || '-'}
                        </div>
                        <div>
                          <b>Mobile:</b> {token.user.mobile || '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 border text-sm">
                    {token.deviceInfo?.brand} {token.deviceInfo?.modelName}
                  </td>
                  <td className="p-3 border text-sm">
                    {token.lastActiveAt ? new Date(token.lastActiveAt).toLocaleDateString() : ''}
                  </td>
                  <td className="p-3 border">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={token.isActive}
                        onChange={async () => {
                          try {
                            await fetch(`/api/notifications/tokens/${token._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isActive: !token.isActive }),
                            })
                            fetchTokens()
                          } catch (error) {
                            console.error('Error updating token status:', error)
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
