import { Server } from 'socket.io'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chat from '@/models/Chat'
import { User } from '@/models'
import { connectToDatabase } from '@/helpers/db'

// Required for Next.js App Router
export const dynamic = 'force-dynamic'

// Track online admins
const onlineAdmins = new Map()
// Track user-admin connections
const userAdminConnections = new Map()
// Track connection status
const connectionStatus = new Map()

export async function GET(req) {
  // Get the res object from the request context
  const res = req.socket.server

  // Initialize Socket.io if not already done
  if (!res.io) {
    console.log('🔌 Setting up Socket.IO server...')

    // Initialize Socket.IO server with better configuration
    const io = new Server(res, {
      path: '/api/ws',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 5 * 60 * 1000, // 5 minutes
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
      },
      pingTimeout: 30000, // 30 seconds
      pingInterval: 10000, // 10 seconds
    })

    // Make io available globally to use in other API routes
    res.io = io
    global.io = io

    try {
      // Connect to MongoDB
      await connectToDatabase()
      console.log('🔌 Connected to MongoDB for WebSockets')
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB:', err)
    }

    // Basic authentication middleware with improved error handling
    io.use((socket, next) => {
      try {
        console.log('🔌 Socket authentication attempt:', socket.id)

        // Get token from handshake auth or query
        const token = socket.handshake.auth?.token || socket.handshake.query?.token

        console.log('🔌 Socket auth token exists:', !!token)

        // For development, allow connections without token
        if (!token) {
          socket.user = { id: 'anonymous', role: 'guest' }
          console.log('🔌 No token provided, allowing as guest:', socket.id)
          return next()
        }

        // Verify token here
        try {
          // Basic parsing - in real app use proper JWT verification
          const tokenParts = token.split('.')
          if (tokenParts.length !== 3) {
            console.warn('🔌 Invalid token format')
            socket.user = { id: 'guest', role: 'guest' }
            return next()
          }

          const tokenData = Buffer.from(tokenParts[1] || '', 'base64').toString()
          const decoded = JSON.parse(tokenData)

          console.log('🔌 Socket token decoded:', {
            id: decoded.id || decoded.sub,
            role: decoded.role,
          })

          socket.user = {
            id: decoded.id || decoded.sub || 'unknown',
            role: decoded.role || 'user',
            name: decoded.name || 'User',
          }

          console.log(
            '🔌 Socket authenticated for user:',
            socket.user.id,
            'role:',
            socket.user.role
          )
        } catch (err) {
          console.warn('🔌 Token parsing error, allowing as guest:', err.message)
          socket.user = { id: 'guest', role: 'guest' }
        }

        next()
      } catch (error) {
        console.error('❌ Socket authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })

    // Broadcast online admin status every 30 seconds
    setInterval(() => {
      const adminList = Array.from(onlineAdmins.values())
      io.emit('admin_status_list', {
        admins: adminList,
        count: adminList.length,
        timestamp: new Date(),
      })
    }, 30000)

    // Handle socket connections
    io.on('connection', async socket => {
      console.log(
        '🔌 Client connected:',
        socket.id,
        'User:',
        socket.user?.id,
        'Role:',
        socket.user?.role
      )

      const userId = socket.user?.id
      const userRole = socket.user?.role
      const userName = socket.user?.name || 'User'

      // Mark user as connected
      connectionStatus.set(userId, {
        online: true,
        lastActivity: new Date(),
        socketId: socket.id,
      })

      // Join admin room if user is admin
      if (userRole === 'admin') {
        socket.join('admin-room')
        console.log('🔌 Admin joined admin room:', socket.id)

        // Add to online admins
        onlineAdmins.set(userId, {
          id: userId,
          name: userName,
          socketId: socket.id,
          lastActivity: new Date(),
        })

        // Notify all clients about active admin
        io.emit('admin_status', {
          online: true,
          adminId: userId,
          adminName: userName,
          timestamp: new Date(),
        })

        // Send list of all online admins to this admin
        socket.emit('admin_status_list', {
          admins: Array.from(onlineAdmins.values()),
          count: onlineAdmins.size,
          timestamp: new Date(),
        })
      }

      // Join user's personal room
      const userRoom = `user-${userId}`
      socket.join(userRoom)
      console.log(`🔌 User joined personal room: ${userRoom}`)

      // Notify the client that they are connected
      socket.emit('connection_status', {
        connected: true,
        userId: userId,
        role: userRole,
        timestamp: new Date(),
        adminOnline: onlineAdmins.size > 0,
        adminCount: onlineAdmins.size,
      })

      // Find existing chats for this user to avoid creating duplicates
      try {
        // For users: find their chats
        if (userRole === 'user' || userRole === 'guest') {
          await connectToDatabase()

          // Find any existing chats for this user - more comprehensive search
          const existingChats = await Chat.find({
            $or: [
              { 'participants.id': userId },
              { 'sender.id': userId },
              { 'user.id': userId },
              { chatId: userId },
            ],
            status: { $ne: 'closed' }, // Only find active chats
          })
            .sort({ lastActivity: -1 })
            .limit(5)

          if (existingChats && existingChats.length > 0) {
            console.log(`🔌 Found ${existingChats.length} existing chats for user ${userId}`)

            // Join all chat rooms for this user
            existingChats.forEach(chat => {
              const chatRoomId = `chat-${chat._id}`
              socket.join(chatRoomId)
              console.log(`🔌 User ${userId} joined existing chat room: ${chatRoomId}`)
            })

            // Send the most recent chat to the user
            const mostRecentChat = existingChats[0]
            socket.emit('existing_chat', {
              chatId: mostRecentChat._id,
              messages: mostRecentChat.messages || [],
              status: mostRecentChat.status,
              lastActivity: mostRecentChat.lastActivity,
              isActive: true, // Tell client this is active
            })

            // Alert admins about user reconnection to existing chat
            io.to('admin-room').emit('user_reconnected', {
              userId,
              userName,
              chatId: mostRecentChat._id,
              lastActivity: mostRecentChat.lastActivity,
            })
          } else {
            // No existing chats found
            console.log(`🔌 No existing chats found for user ${userId}`)
            socket.emit('existing_chat', {
              chatId: null,
              messages: [],
              status: 'new',
              isActive: false,
            })
          }
        }

        // For admins: send list of all active chats
        if (userRole === 'admin') {
          await connectToDatabase()
          const activeChats = await Chat.find({
            status: { $ne: 'closed' },
          })
            .sort({ lastActivity: -1 })
            .limit(100)

          console.log(`🔌 Sending ${activeChats.length} active chats to admin ${userId}`)

          // Join all active chat rooms
          activeChats.forEach(chat => {
            const chatRoomId = `chat-${chat._id}`
            socket.join(chatRoomId)
          })

          socket.emit('active_chats', {
            chats: activeChats,
            count: activeChats.length,
            timestamp: new Date(),
          })
        }
      } catch (err) {
        console.error('❌ Error finding existing chats:', err)
      }

      // Handle joining a support room
      socket.on('join_support_room', async data => {
        try {
          console.log('🔌 Join support room request:', data)

          const userId = data.userId || socket.user?.id
          if (!userId) {
            socket.emit('error', { message: 'User ID is required' })
            return
          }

          // Create a support room ID
          const supportRoomId = `support-${userId}`
          socket.join(supportRoomId)

          console.log(`🔌 User ${userId} joined support room: ${supportRoomId}`)

          // Notify admin room about new support request
          io.to('admin-room').emit('support_request', {
            userId,
            name: data.name || socket.user?.name || 'User',
            email: data.email,
            roomId: supportRoomId,
            timestamp: new Date(),
          })

          // Notify the user that they joined successfully
          socket.emit('support_status', {
            status: 'active',
            adminOnline: onlineAdmins.size > 0,
            timestamp: new Date(),
          })

          // Look for existing chats for this user
          try {
            await connectToDatabase()
            const existingChats = await Chat.find({
              $or: [{ 'participants.id': userId }, { 'sender.id': userId }, { chatId: userId }],
            })
              .sort({ lastActivity: -1 })
              .limit(1)

            if (existingChats.length > 0) {
              const latestChat = existingChats[0]
              console.log(`🔌 Found existing chat for user ${userId}:`, latestChat._id)

              // Join the chat room
              const chatRoomId = `chat-${latestChat._id}`
              socket.join(chatRoomId)

              // Notify client with existing chat
              socket.emit('chat_info', {
                chatId: latestChat._id,
                status: latestChat.status,
                lastActivity: latestChat.lastActivity,
                messages: latestChat.messages || [],
              })
            }
          } catch (dbErr) {
            console.error('❌ Error finding existing chats:', dbErr)
          }
        } catch (err) {
          console.error('❌ Error in join_support_room handler:', err)
          socket.emit('error', { message: 'Failed to join support room' })
        }
      })

      // Handle send message
      socket.on('send_message', async msg => {
        try {
          console.log(
            `🔌 Received message: ${msg.content?.substring(0, 50)}${
              msg.content?.length > 50 ? '...' : ''
            }`
          )

          // Check if this is an echo prevention request
          const preventEcho = msg.preventEcho === true
          console.log(`🔌 preventEcho flag: ${preventEcho}`)

          // Validate sender information
          const sender = {
            id: msg.userId || socket.userId || 'unknown',
            name: msg.userName || socket.userName || 'Unknown User',
            role: msg.type === 'admin' ? 'admin' : 'user',
          }
          console.log(`🔌 Sender: ${sender.name} (${sender.id}) [${sender.role}]`)

          // Get chat ID from message, socket, or create new one
          let chatId = msg.chatId
          console.log(`🔌 Received chatId in message: ${chatId || 'none'}`)

          if (!chatId) {
            try {
              await connectToDatabase()

              // Try to find an existing chat for this user with more robust search
              const existingChat = await Chat.findOne({
                $or: [
                  { 'participants.id': sender.id },
                  { 'participants.id': sender.id.toString() },
                  { 'sender.id': sender.id },
                  { 'sender.id': sender.id.toString() },
                  { 'user.id': sender.id },
                  { 'user.id': sender.id.toString() },
                  { chatId: sender.id },
                  { chatId: sender.id.toString() },
                ],
                status: { $ne: 'closed' },
              }).sort({ lastActivity: -1 })

              if (existingChat) {
                chatId = existingChat._id
                console.log(`🔌 Using existing chat for message: ${chatId}`)
              } else {
                // Create a new chat only if no existing one found
                const newChat = new Chat({
                  chatId: sender.id,
                  status: 'active',
                  user: {
                    id: sender.id,
                    name: sender.name || 'User',
                    role: sender.role,
                  },
                  participants: [sender],
                  messages: [],
                  lastActivity: new Date(),
                })

                await newChat.save()
                chatId = newChat._id
                console.log(`🔌 Created new chat for message: ${chatId}`)

                // Notify admins about new chat
                io.to('admin-room').emit('new_chat', {
                  chatId: newChat._id,
                  sender: sender,
                  timestamp: new Date(),
                })
              }
            } catch (dbErr) {
              console.error('❌ Error handling chat for message:', dbErr)
              socket.emit('error', { message: 'Failed to process message' })
              return
            }
          }

          // Format the message
          const messageData = {
            content: msg.content,
            sender: sender,
            timestamp: new Date(),
            type: msg.type || (sender.role === 'admin' ? 'admin' : 'user'),
            metadata: msg.metadata || {},
          }

          // Save message to database
          try {
            await connectToDatabase()
            const chat = await Chat.findById(chatId)

            if (!chat) {
              throw new Error(`Chat not found: ${chatId}`)
            }

            // Add message to chat
            chat.messages.push(messageData)
            chat.lastActivity = new Date()
            chat.lastMessage = {
              content: messageData.content,
              timestamp: messageData.timestamp,
              sender: sender.role,
            }

            await chat.save()
            console.log(`🔌 Message saved to chat ${chatId}`)

            // Join this chat room if not already joined
            const chatRoomId = `chat-${chatId}`
            if (!socket.rooms.has(chatRoomId)) {
              socket.join(chatRoomId)
              console.log(`🔌 User ${sender.id} joined chat room: ${chatRoomId}`)
            }

            // Don't broadcast if preventEcho flag is set to prevent duplicate messages
            if (!preventEcho) {
              // Broadcast message to all users in the chat room
              io.to(chatRoomId).emit('message', {
                ...messageData,
                chatId,
                _id: chat.messages[chat.messages.length - 1]._id, // Get the MongoDB-generated ID
              })
            } else {
              // Send confirmation only to sender but not an echo message
              socket.emit('message_sent', {
                messageId: chat.messages[chat.messages.length - 1]._id,
                chatId,
                timestamp: new Date(),
              })

              // Also send the message to admin room to ensure visibility, but with a different event
              if (sender.role === 'user') {
                io.to('admin-room').emit('user_message', {
                  ...messageData,
                  chatId,
                  _id: chat.messages[chat.messages.length - 1]._id,
                })
              }
            }
          } catch (dbErr) {
            console.error('❌ Error saving message:', dbErr)
            socket.emit('error', { message: 'Failed to save message' })
            return
          }
        } catch (err) {
          console.error('❌ Error in send_message handler:', err)
          socket.emit('error', { message: 'Failed to process message' })
        }
      })

      // Handle admin viewing chat
      socket.on('admin_viewing', async data => {
        if (socket.user?.role !== 'admin') return

        try {
          const { chatId, adminId, adminName } = data
          console.log(`🔌 Admin ${adminId} viewing chat ${chatId}`)

          // Join the chat room if not already joined
          const chatRoomId = `chat-${chatId}`
          if (!socket.rooms.has(chatRoomId)) {
            socket.join(chatRoomId)
          }

          // Store user-admin connection
          const chat = await Chat.findById(chatId)
          if (chat) {
            const userId = chat.participants.find(p => p.role !== 'admin')?.id || chat.sender?.id

            if (userId) {
              userAdminConnections.set(userId, {
                adminId,
                adminName,
                chatId,
                lastActivity: new Date(),
              })

              // Notify user that admin is viewing the chat
              const userRoom = `user-${userId}`
              io.to(userRoom).emit('admin_activity', {
                type: 'viewing',
                adminId,
                adminName,
                chatId,
                timestamp: new Date(),
              })
            }
          }
        } catch (err) {
          console.error('❌ Error in admin_viewing handler:', err)
        }
      })

      // Handle typing indicators
      socket.on('typing', data => {
        try {
          const { chatId, isTyping } = data
          if (!chatId) return

          const chatRoomId = `chat-${chatId}`
          socket.to(chatRoomId).emit('typing_indicator', {
            userId: socket.user?.id,
            userName: socket.user?.name,
            role: socket.user?.role,
            isTyping,
            chatId,
            timestamp: new Date(),
          })
        } catch (err) {
          console.error('❌ Error in typing handler:', err)
        }
      })

      // Handle read receipts
      socket.on('read_receipt', async data => {
        try {
          const { chatId, messageIds } = data
          if (!chatId || !messageIds?.length) return

          const chatRoomId = `chat-${chatId}`

          // Update database
          try {
            await connectToDatabase()
            await Chat.updateMany(
              { _id: chatId, 'messages._id': { $in: messageIds } },
              { $set: { 'messages.$.deliveryStatus': 'read', 'messages.$.readAt': new Date() } }
            )
          } catch (dbErr) {
            console.error('❌ Error updating read receipts:', dbErr)
          }

          // Broadcast read receipt
          socket.to(chatRoomId).emit('messages_read', {
            userId: socket.user?.id,
            role: socket.user?.role,
            chatId,
            messageIds,
            timestamp: new Date(),
          })
        } catch (err) {
          console.error('❌ Error in read_receipt handler:', err)
        }
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}, User: ${socket.user?.id}`)

        const userId = socket.user?.id
        const userRole = socket.user?.role

        // Update connection status
        if (connectionStatus.has(userId)) {
          connectionStatus.get(userId).online = false
          connectionStatus.get(userId).lastDisconnect = new Date()
        }

        // Handle admin disconnect
        if (userRole === 'admin' && onlineAdmins.has(userId)) {
          onlineAdmins.delete(userId)
          console.log(`🔌 Admin removed from online list: ${userId}`)

          // Notify all clients about admin going offline
          io.emit('admin_status', {
            online: false,
            adminId: userId,
            timestamp: new Date(),
          })
        }
      })
    })
  }

  // Return WebSocket health info
  return NextResponse.json({
    status: 'ok',
    message: 'WebSocket server is running',
    adminCount: onlineAdmins.size,
    time: new Date().toISOString(),
  })
}

// Configuration
export const config = {
  api: {
    bodyParser: false,
  },
}
