import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Chat from '@/models/Chat'
import { verifyAuth } from '@/utils/auth'

// GET /api/admin/chats/[chatId] - Get a specific chat
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

    // Format chat for admin interface
    const formattedChat = {
      _id: chat._id,
      chatId: chat.caseId,
      user: {
        id: chat.userId?._id || chat.userId,
        name: chat.userId?.name || 'Unknown User',
        email: chat.userId?.email || '',
        avatar: chat.userId?.avatar || null,
      },
      status: chat.status,
      messages: chat.messages,
      lastMessage: chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null,
      unreadCount: chat.messages?.filter(m => !m.readBy?.includes(authResult.userId)).length || 0,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      supportReason: chat.supportReason,
    }

    return NextResponse.json({
      success: true,
      data: formattedChat,
    })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 })
  }
}

// PATCH /api/admin/chats/[chatId] - Update chat status
export async function PATCH(req, { params }) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { chatId } = params
    const { status } = await req.json()

    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { caseId: chatId }],
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Update chat status
    chat.status = status
    chat.updatedAt = new Date()

    // Add system message about status change
    chat.messages.push({
      type: 'system',
      content: `Chat status changed to ${status}`,
      timestamp: new Date(),
    })

    await chat.save()

    // Emit socket event if available
    if (global.io) {
      global.io.to(chatId).emit('chat_updated', {
        chatId,
        status,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      data: chat,
    })
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 })
  }
}

// DELETE /api/admin/chats/[chatId] - Close/Archive a chat
export async function DELETE(req, { params }) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { chatId } = params

    const chat = await Chat.findOne({
      $or: [{ _id: chatId }, { caseId: chatId }],
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Instead of deleting, mark as closed
    chat.status = 'closed'
    chat.updatedAt = new Date()
    chat.messages.push({
      type: 'system',
      content: 'Chat closed by admin',
      timestamp: new Date(),
    })

    await chat.save()

    // Emit socket event if available
    if (global.io) {
      global.io.to(chatId).emit('chat_closed', {
        chatId,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Chat closed successfully',
    })
  } catch (error) {
    console.error('Error closing chat:', error)
    return NextResponse.json({ error: 'Failed to close chat' }, { status: 500 })
  }
}
