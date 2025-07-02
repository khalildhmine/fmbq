import { NextResponse } from 'next/server'
// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'
import Chat from '@/models/Chat'
import { verifyAuth } from '@/utils/auth'
import mongoose from 'mongoose'

// POST /api/support-message/send - Add a user message to a chat
export async function POST(req) {
  try {
    // Verify user authentication
    const authResult = await verifyAuth(req)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const data = await req.json()
    const { caseId, content, type = 'TEXT' } = data

    if (!caseId || !content) {
      return NextResponse.json(
        { error: 'Case ID and message content are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find the chat by caseId
    const chat = await Chat.findOne({ caseId })
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Verify the user is the owner of this chat
    if (chat.userId.toString() !== authResult.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to send messages to this chat' },
        { status: 403 }
      )
    }

    // Ensure the chat is not closed
    if (chat.status === 'CLOSED' || chat.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'Cannot add message to a closed or resolved chat' },
        { status: 400 }
      )
    }

    // Add the message to the chat
    const newMessage = {
      sender: new mongoose.Types.ObjectId(authResult.userId),
      content,
      type,
      timestamp: new Date(),
      readBy: [new mongoose.Types.ObjectId(authResult.userId)], // Mark as read by sender
    }

    chat.messages.push(newMessage)
    chat.metadata.lastActivity = new Date()

    // Save the updated chat
    await chat.save()

    // Notify via socket if available
    if (global.io) {
      const messageToSend = {
        _id: newMessage._id.toString(),
        chatId: chat._id.toString(),
        caseId: chat.caseId,
        content: newMessage.content,
        type: newMessage.type,
        sender: authResult.userId,
        timestamp: newMessage.timestamp.toISOString(),
      }

      // Notify admin room
      global.io.to('admin_room').emit('new_message', messageToSend)

      // Notify specific chat room
      global.io.to(`chat_${chat._id}`).emit('new_message', messageToSend)
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      result: {
        _id: newMessage._id,
        content: newMessage.content,
        type: newMessage.type,
        timestamp: newMessage.timestamp,
      },
    })
  } catch (error) {
    console.error(`[SUPPORT MESSAGE][POST] Error: ${error.message}`)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
