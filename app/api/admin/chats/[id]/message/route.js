import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Chat from '@/models/Chat'
import { connectToDatabase } from '@/helpers/db'

// This endpoint handles adding messages to a chat from the admin side
export async function POST(request, { params }) {
  try {
    const chatId = params.id
    const messageData = await request.json()

    console.log('[Chat API] Adding message to chat:', { chatId, messageData })

    if (!chatId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chat ID is required',
        },
        { status: 400 }
      )
    }

    // Validate message data
    if (!messageData.content || typeof messageData.content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Message content is required',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Format the message
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: messageData.content,
      sender: {
        id: messageData.adminId || 'admin',
        name: messageData.adminName || 'Admin',
        role: 'admin',
      },
      timestamp: new Date(),
      deliveryStatus: 'sent',
      metadata: {
        device: 'web',
        origin: 'admin',
      },
    }

    // Find the chat and add the message
    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { chatId: chatId }],
    })

    if (!chat) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chat not found',
        },
        { status: 404 }
      )
    }

    // Add message to the chat
    chat.messages.push(newMessage)

    // Update last message and activity
    chat.lastMessage = {
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      sender: 'admin',
    }

    chat.lastActivity = new Date()

    // Save the updated chat
    await chat.save()

    // Emit the message via WebSocket if socket.io is available
    if (process.env.NEXT_PUBLIC_ENABLE_SOCKETS === 'true' && global.io) {
      global.io.to(chatId).emit('chat_message', {
        ...newMessage,
        chatId: chatId,
      })

      console.log('[Chat API] Message emitted via socket')
    }

    return NextResponse.json({
      success: true,
      message: 'Message added successfully',
      data: {
        message: newMessage,
        chat: {
          _id: chat._id,
          chatId: chat.chatId,
          status: chat.status,
          lastActivity: chat.lastActivity,
        },
      },
    })
  } catch (error) {
    console.error('[Chat API] Error adding message:', error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to add message',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
