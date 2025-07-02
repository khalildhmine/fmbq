import { NextResponse } from 'next/server'
// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'
import Chat from '@/models/Chat'
import { verifyAuth } from '@/utils/auth'
import mongoose from 'mongoose'

// POST /api/admin/chats/message - Add a message to a chat
// Fix the error: Cannot read properties of undefined (reading 'toString')
export async function POST(req) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      console.warn('[ADMIN CHATS MESSAGE][POST] Unauthorized access attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { chatId, content, type = 'TEXT', senderId } = data

    if (!chatId || !content) {
      return NextResponse.json(
        { error: 'Chat ID and message content are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const chat = await Chat.findById(chatId)

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Create a valid sender ID (this is where the error is happening)
    // Make sure we have a valid ObjectId for the sender
    const validSenderId = senderId
      ? mongoose.Types.ObjectId.isValid(senderId)
        ? senderId
        : authResult.userId
      : authResult.userId

    // Add the message to the chat
    const newMessage = {
      content,
      type,
      sender: validSenderId, // Use the valid sender ID
      timestamp: new Date(),
    }

    chat.messages.push(newMessage)
    chat.updatedAt = new Date()
    await chat.save()

    // Emit the message via socket if available
    if (global.io) {
      // Format the message for the client
      const messageForClient = {
        _id: newMessage._id.toString(),
        chatId,
        caseId: chat.caseId, // Include caseId for mobile app
        content: newMessage.content,
        type: newMessage.type,
        sender: {
          role: 'admin',
          id: validSenderId,
          name: authResult.name || 'Admin',
        },
        timestamp: newMessage.timestamp.toISOString(),
      }

      // Emit to the chat room
      global.io.to(`chat_${chatId}`).emit('new_message', messageForClient)

      // Also emit to the case ID room for mobile app
      if (chat.caseId) {
        global.io.to(`${chat.caseId}`).emit('new_message', messageForClient)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      result: {
        _id: newMessage._id,
        content,
        type,
        sender: {
          role: 'admin',
          id: validSenderId,
          name: authResult.name || 'Admin',
        },
        timestamp: newMessage.timestamp,
      },
    })
  } catch (error) {
    console.error(`[ADMIN CHATS MESSAGE][POST] Error: ${error.message}`)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
