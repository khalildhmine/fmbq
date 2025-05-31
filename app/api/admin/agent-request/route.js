import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chat from '@/models/Chat'
import { connectToDatabase, connect } from '@/helpers/db'

// POST endpoint to handle agent requests
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
    const { chatId, action, adminId, adminName } = body

    if (!chatId || !action) {
      return NextResponse.json({ error: 'Chat ID and action are required' }, { status: 400 })
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      )
    }

    // Find the chat
    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { chatId: chatId }],
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Update chat status based on action
    if (action === 'accept') {
      chat.status = 'active'

      // Add system message about agent accepting the chat
      const systemMessage = {
        _id: new mongoose.Types.ObjectId(),
        content: `${adminName || 'Support Agent'} has accepted your request and joined the chat.`,
        sender: {
          id: adminId || 'admin',
          name: adminName || 'Support Agent',
          role: 'system',
        },
        timestamp: new Date(),
        deliveryStatus: 'sent',
        type: 'agent_connected',
      }

      chat.messages.push(systemMessage)
      chat.assignedAdmin = {
        id: adminId || 'admin',
        name: adminName || 'Support Agent',
        joinedAt: new Date(),
      }

      // Notify user via socket if available
      if (global.io) {
        try {
          // Emit to chat room
          global.io.to(`chat-${chatId}`).emit('chat_message', {
            ...systemMessage,
            chatId: chat._id,
          })

          // Emit agent connected event
          global.io.to(`support-${chat.user.id}`).emit('agent_connected', {
            name: adminName || 'Support Agent',
            id: adminId || 'admin',
            chatId: chat._id,
          })

          // Also emit agent request response
          global.io.to(`support-${chat.user.id}`).emit('agent_request_response', {
            accepted: true,
            agentName: adminName || 'Support Agent',
            agentId: adminId || 'admin',
            chatId: chat._id,
          })

          console.log('🔔 Notified user that agent accepted request')
        } catch (socketError) {
          console.error('Socket notification error:', socketError)
        }
      }
    } else if (action === 'reject') {
      chat.status = 'closed'

      // Add system message about rejection
      const systemMessage = {
        _id: new mongoose.Types.ObjectId(),
        content: 'Your request for support has been declined. Please try again later.',
        sender: {
          id: 'system',
          name: 'System',
          role: 'system',
        },
        timestamp: new Date(),
        deliveryStatus: 'sent',
        type: 'agent_rejected',
      }

      chat.messages.push(systemMessage)

      // Notify user via socket if available
      if (global.io) {
        try {
          // Emit to chat room
          global.io.to(`chat-${chatId}`).emit('chat_message', {
            ...systemMessage,
            chatId: chat._id,
          })

          // Emit agent request response
          global.io.to(`support-${chat.user.id}`).emit('agent_request_response', {
            accepted: false,
            chatId: chat._id,
          })

          console.log('🔔 Notified user that agent rejected request')
        } catch (socketError) {
          console.error('Socket notification error:', socketError)
        }
      }
    }

    chat.lastActivity = new Date()
    await chat.save()

    console.log(`🔧 Agent ${action}ed chat request:`, chatId)

    return NextResponse.json({
      success: true,
      action,
      chatId: chat._id,
      status: chat.status,
    })
  } catch (error) {
    console.error('Error handling agent request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process agent request' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve pending agent requests
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

    // Get pending chats
    const pendingChats = await Chat.find({
      status: 'pending',
    }).sort({ lastActivity: -1 })

    // Format response
    const pendingRequests = pendingChats.map(chat => ({
      chatId: chat._id,
      userId: chat.user.id,
      userName: chat.user.name,
      userEmail: chat.user.email,
      createdAt: chat.createdAt,
      lastActivity: chat.lastActivity,
      messageCount: chat.messages.length,
      requestMessage:
        chat.messages.find(
          msg =>
            msg.type === 'agent_request' ||
            (msg.sender.role === 'system' && msg.content.includes('requested support'))
        )?.content || 'Support assistance requested',
    }))

    return NextResponse.json({
      success: true,
      pendingRequests,
      count: pendingRequests.length,
    })
  } catch (error) {
    console.error('Error retrieving pending agent requests:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve pending requests' },
      { status: 500 }
    )
  }
}
