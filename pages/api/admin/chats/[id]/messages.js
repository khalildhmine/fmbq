import { connectToDatabase } from '@/helpers/db'
import Chat from '@/models/Chat'
import { authenticate } from '@/helpers/auth'

export default async function handler(req, res) {
  // Add CORS headers to allow all origins for development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Set no-cache headers for real-time data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Validate request
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Authenticate request
    const user = await authenticate(req, res, ['admin'])
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    // Get chat ID from route parameter
    const { id } = req.query

    // Get the since parameter (to only get messages since a certain time)
    const since = req.query.since ? new Date(req.query.since) : null

    // Get limit parameter with default and max values
    const limit = Math.min(parseInt(req.query.limit) || 100, 200)

    // Check if we should include full chat info or just messages
    const messagesOnly = req.query.messagesOnly === 'true'

    if (!id) {
      return res.status(400).json({ success: false, message: 'Chat ID is required' })
    }

    // Connect to database
    await connectToDatabase()

    // Find chat by ID using a lean query for better performance when polling
    const chat = await Chat.findById(id).lean()

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' })
    }

    // Get messages, applying filter for since parameter if provided
    let messages = chat.messages || []

    if (since) {
      // Improved date comparison for efficiency
      const sinceTime = new Date(since).getTime()
      messages = messages.filter(msg => {
        // Handle various timestamp formats
        const msgTime = new Date(msg.timestamp || msg.createdAt).getTime()
        return msgTime > sinceTime
      })
    }

    // Apply limit (get most recent messages)
    if (messages.length > limit) {
      messages = messages.slice(messages.length - limit)
    }

    // For frequent polling, we can just return messages to reduce payload size
    if (messagesOnly) {
      return res.status(200).json({
        success: true,
        data: messages,
        total: messages.length,
        timestamp: new Date(),
      })
    }

    // Return full response with chat details
    return res.status(200).json({
      success: true,
      data: messages,
      total: messages.length,
      chatId: chat._id,
      status: chat.status,
      lastActivity: chat.lastActivity,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return res.status(500).json({ success: false, message: 'Error fetching chat messages' })
  }
}
