import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chat from '@/models/Chat'
import { connectToDatabase, connect } from '@/helpers/db'

// POST endpoint to create a new message or chat
export async function POST(req) {
  try {
    // Ensure connection is fully established
    await connect()

    // Additional safety check - wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection to be ready...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (mongoose.connection.readyState !== 1) {
        throw new Error('Failed to establish MongoDB connection')
      }
    }

    const body = await req.json()
    const { userId, content, userName, userEmail, chatId, isSystemMessage, type } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Special handling for agent requests
    const isAgentRequest =
      type === 'request' || (isSystemMessage && content?.includes('requested support assistance'))

    if (isAgentRequest) {
      console.log('📨 HTTP Message API: Received agent request from user:', userId)

      // Find if the user already has an active chat
      const existingChat = await Chat.findOne({
        'user.id': userId,
        status: { $in: ['active', 'pending'] },
      }).sort({ lastActivity: -1 })

      if (existingChat) {
        // If user already has an active/pending chat, use that
        console.log('📨 HTTP Message API: User already has an active chat:', existingChat._id)

        // Add request message if it's a new request
        if (content) {
          const requestMessage = {
            _id: new mongoose.Types.ObjectId(),
            content: content,
            sender: {
              id: 'system',
              name: 'System',
              role: 'system',
            },
            timestamp: new Date(),
            deliveryStatus: 'sent',
            type: 'agent_request',
            metadata: {
              isAgentRequest: true,
            },
          }

          existingChat.messages.push(requestMessage)
          existingChat.lastActivity = new Date()
          await existingChat.save()
        }

        // Notify through socket
        if (global.io) {
          try {
            global.io.to('admin-room').emit('support_request', {
              userId,
              name: userName || 'User',
              email: userEmail,
              chatId: existingChat._id,
              timestamp: new Date(),
              status: 'pending',
            })
            console.log('📨 HTTP Message API: Notified admins of agent request for existing chat')
          } catch (socketError) {
            console.error('Socket notification error:', socketError)
          }
        }

        return NextResponse.json({
          success: true,
          chatId: existingChat._id,
          messageId: existingChat.messages[existingChat.messages.length - 1]._id,
          timestamp: new Date(),
          status: 'pending',
        })
      }

      // Create a new chat for the agent request
      const newChat = new Chat({
        chatId: new mongoose.Types.ObjectId().toString(),
        status: 'pending', // Mark as pending until an agent accepts it
        user: {
          id: userId,
          name: userName || 'User',
          email: userEmail || '',
        },
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
      })

      // Add the request message
      const requestMessage = {
        _id: new mongoose.Types.ObjectId(),
        content: content || '👋 [SYSTEM] User has requested support assistance',
        sender: {
          id: 'system',
          name: 'System',
          role: 'system',
        },
        timestamp: new Date(),
        deliveryStatus: 'sent',
        type: 'agent_request',
        metadata: {
          isAgentRequest: true,
        },
      }

      newChat.messages.push(requestMessage)
      newChat.lastMessage = {
        content: requestMessage.content,
        timestamp: new Date(),
        sender: 'system',
      }

      await newChat.save()
      console.log('📨 HTTP Message API: Created new agent request chat:', newChat._id)

      // Notify admins through socket
      if (global.io) {
        try {
          global.io.to('admin-room').emit('support_request', {
            userId,
            name: userName || 'User',
            email: userEmail,
            chatId: newChat._id,
            timestamp: new Date(),
            status: 'pending',
          })
          console.log('📨 HTTP Message API: Socket notification sent to admin room for new request')
        } catch (socketError) {
          console.error('Socket notification error:', socketError)
        }
      }

      return NextResponse.json({
        success: true,
        chatId: newChat._id,
        messageId: requestMessage._id,
        timestamp: requestMessage.timestamp,
        status: 'pending',
      })
    }

    // Regular message handling (not an agent request)
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    console.log('📨 HTTP Message API: Received message from user:', userId)

    // Find existing chat or create new one
    let chat
    if (chatId) {
      // Always try to find the existing chat first with more robust search
      try {
        console.log('📨 HTTP Message API: Searching for chat by provided ID:', chatId)
        chat = await Chat.findOne({
          $or: [{ _id: chatId }, { chatId: chatId }, { chatId: chatId.toString() }],
        })

        console.log('📨 HTTP Message API: Found existing chat by ID:', chat ? chat._id : 'none')
      } catch (findError) {
        console.error('📨 HTTP Message API: Error finding chat by ID:', findError)
      }
    }

    // If no chat found by ID, then try finding by user ID with enhanced search
    if (!chat) {
      console.log('📨 HTTP Message API: No chat found by ID, searching by user ID:', userId)
      try {
        // Enhanced search for user chats with more options and better logging
        chat = await Chat.findOne({
          $or: [
            { 'user.id': userId },
            { 'user.id': userId.toString() },
            { 'participants.id': userId },
            { 'participants.id': userId.toString() },
            { 'sender.id': userId },
            { 'sender.id': userId.toString() },
            { chatId: userId },
            { chatId: userId.toString() },
          ],
          status: { $ne: 'closed' },
        }).sort({ lastActivity: -1 })

        console.log('📨 HTTP Message API: Search by user result:', chat ? chat._id : 'none')
      } catch (findUserError) {
        console.error('📨 HTTP Message API: Error finding chat by user ID:', findUserError)
      }
    }

    // Only create a new chat if absolutely necessary
    if (!chat) {
      // Create a new chat
      try {
        console.log('📨 HTTP Message API: Creating new chat for user:', userId)
        chat = new Chat({
          chatId: new mongoose.Types.ObjectId().toString(),
          status: 'active',
          user: {
            id: userId,
            name: userName || 'User',
            email: userEmail || '',
          },
          messages: [],
          createdAt: new Date(),
          lastActivity: new Date(),
        })
        console.log('📨 HTTP Message API: New chat created with ID:', chat._id)
      } catch (createError) {
        console.error('📨 HTTP Message API: Error creating new chat:', createError)
        return NextResponse.json({ error: 'Failed to create new chat' }, { status: 500 })
      }
    }

    // Add the message
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: content,
      sender: {
        id: userId,
        name: userName || 'User',
        role: 'user',
      },
      timestamp: new Date(),
      deliveryStatus: 'sent',
      type: 'text',
    }

    chat.messages.push(newMessage)
    chat.lastMessage = {
      content: content,
      timestamp: new Date(),
      sender: 'user',
    }
    chat.lastActivity = new Date()

    await chat.save()
    console.log('📨 HTTP Message API: Message saved, chat ID:', chat._id)

    // Don't send notifications for preventEcho flag which prevents message echoing
    const preventEcho = body.preventEcho === true

    // Emit socket message if socket.io is available and not preventing echo
    if (global.io && !preventEcho) {
      try {
        // Emit the message to the chat room
        global.io.to(`chat-${chat._id}`).emit('chat_message', {
          ...newMessage,
          chatId: chat._id,
        })

        // Also emit to admin room with a specific event name for better handling
        // Use a more specific event name for real-time dashboard updates
        global.io.to('admin-room').emit('new_message', {
          ...newMessage,
          chatId: chat._id,
          userId,
          userName: userName || 'User',
        })

        // Add a second broadcast with a more specific event for dashboard
        global.io.to('admin-room').emit('dashboard_message_update', {
          message: {
            ...newMessage,
            chatId: chat._id,
          },
          chat: {
            _id: chat._id,
            userId,
            userName: userName || 'User',
            lastActivity: new Date(),
            lastMessage: {
              content: content,
              timestamp: new Date(),
              sender: 'user',
            },
          },
        })

        console.log(
          '📨 HTTP Message API: Socket notifications sent to admin room for real-time updates'
        )
      } catch (socketError) {
        console.error('Socket notification error:', socketError)
      }
    }

    return NextResponse.json({
      success: true,
      chatId: chat._id,
      messageId: newMessage._id,
      timestamp: newMessage.timestamp,
    })
  } catch (error) {
    console.error('Support message API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process support message' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve messages for a chat
export async function GET(req) {
  try {
    // Ensure connection is fully established
    await connect()

    // Additional safety check - wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection to be ready...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (mongoose.connection.readyState !== 1) {
        throw new Error('Failed to establish MongoDB connection')
      }
    }

    // Get query parameters
    const url = new URL(req.url)
    const chatId = url.searchParams.get('chatId')
    const userId = url.searchParams.get('userId')
    const since = url.searchParams.get('since') // Timestamp to get messages since

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let chat
    if (chatId) {
      // Find specific chat
      chat = await Chat.findOne({
        $or: [{ _id: chatId }, { chatId: chatId }],
      })
    } else {
      // Find most recent chat for user
      chat = await Chat.findOne({ 'user.id': userId }).sort({ lastActivity: -1 }).limit(1)
    }

    if (!chat) {
      return NextResponse.json({
        success: true,
        messages: [],
        chatId: null,
        status: 'no_chat',
      })
    }

    // Filter messages if since parameter is provided
    let messages = chat.messages
    if (since) {
      const sinceDate = new Date(since)
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate)
    }

    return NextResponse.json({
      success: true,
      chatId: chat._id,
      status: chat.status,
      messages: messages,
      lastActivity: chat.lastActivity,
    })
  } catch (error) {
    console.error('Support messages retrieval error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve messages' },
      { status: 500 }
    )
  }
}
