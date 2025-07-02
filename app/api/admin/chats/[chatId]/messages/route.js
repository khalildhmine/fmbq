import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Chat from '@/models/Chat'
import { verifyAuth } from '@/utils/auth'

// GET /api/admin/chats/[chatId]/messages - Get messages for a specific chat
export async function GET(req, { params }) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { chatId } = params

    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { caseId: chatId }],
    }).populate('userId', 'name email avatar')

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: chat.messages || [],
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/admin/chats/[chatId]/messages - Add a new message to a chat
export async function POST(req, { params }) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { chatId } = params
    const { content, type = 'admin' } = await req.json()

    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { caseId: chatId }],
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Add new message
    const newMessage = {
      content,
      type,
      timestamp: new Date(),
      sender: {
        id: authResult.userId,
        role: 'admin',
        name: authResult.name || 'Admin',
      },
    }

    chat.messages.push(newMessage)
    chat.updatedAt = new Date()
    await chat.save()

    // Emit socket event if available
    if (global.io) {
      global.io.to(chatId).emit('new_message', {
        chatId,
        message: newMessage,
      })
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
    })
  } catch (error) {
    console.error('Error adding message:', error)
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 })
  }
}
