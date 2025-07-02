import { NextResponse } from 'next/server'
// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'
import Chat from '@/models/Chat'
import { verifyAuth } from '@/utils/auth' // This should be your verifyAuth hook

// GET /api/admin/chats - Get all chats for admin
export async function GET(req) {
  try {
    // Use verifyAuth directly on the request object
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      console.warn('[ADMIN CHATS][GET] Unauthorized access attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // FIX: Use connectDb (not connectDB)
    await connectToDatabase()

    // Fetch all non-closed chats
    const chats = await Chat.find({
      status: { $in: ['PENDING', 'ACTIVE'] }, // Correctly fetch pending and active
    })
      .populate('userId', 'name email avatar') // Populate user details
      .sort({ updatedAt: -1 })
      .lean()

    // Format chats into a consistent structure for the frontend
    const formattedChats = chats.map(chat => ({
      _id: chat._id.toString(),
      user: {
        id: chat.userId?._id?.toString() || 'N/A',
        name: chat.userId?.name || 'Unknown User',
        email: chat.userId?.email || '',
        avatar: chat.userId?.avatar || null,
      },
      status: chat.status.toLowerCase(), // Standardize to lowercase
      messages: chat.messages || [],
      lastMessage: chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1] : null,
      unreadCount: chat.messages?.filter(m => !m.readBy?.includes(authResult.userId)).length || 0,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }))

    console.log(`[ADMIN CHATS][GET] Found and formatted ${formattedChats.length} chats.`)

    // Return a single unified list of chats
    return NextResponse.json({
      success: true,
      chats: formattedChats,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/chats:', error)
    return NextResponse.json({ error: 'Server error while fetching chats.' }, { status: 500 })
  }
}

// POST /api/admin/chats - Create a new chat (admin side)
export async function POST(req) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // FIX: Use connectDb (not connectDB)
    await connectToDatabase()
    const { userId, supportReason, message } = await req.json()

    // Generate case ID (format: SUP-YYMMDD-XXXX)
    const date = new Date()
    const dateStr =
      date.getFullYear().toString().slice(-2) +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const caseId = `SUP-${dateStr}-${randomStr}`

    const chat = await Chat.create({
      caseId,
      userId,
      supportReason,
      status: 'open',
      messages: [
        {
          type: 'system',
          content: message || `Support chat started for ${supportReason}`,
          timestamp: new Date(),
        },
      ],
    })

    return NextResponse.json({
      success: true,
      data: chat,
    })
  } catch (error) {
    console.error('Error creating admin chat:', error)
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}

// PATCH /api/admin/chats - Accept or close a chat (admin side)
// Enhanced PATCH handler for chat status changes
export async function PATCH(req) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.success || !authResult.isAdmin) {
      console.warn('[ADMIN CHATS][PATCH] Unauthorized access attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { chatId, action } = data

    if (!chatId || !action) {
      return NextResponse.json({ error: 'Chat ID and action are required' }, { status: 400 })
    }

    await connectToDatabase()
    const chat = await Chat.findById(chatId)

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Update chat based on action
    if (action === 'accept') {
      chat.status = 'ACTIVE'
      chat.adminId = authResult.userId
      chat.acceptedAt = new Date()

      // Add system message about admin joining
      chat.messages.push({
        content: 'An admin has joined the chat and is ready to assist you.',
        sender: authResult.userId,
        type: 'SYSTEM',
        timestamp: new Date(),
      })

      // --- FIX: Emit to both the chat room (by caseId) and to the user ---
      if (global.io) {
        // Emit to the chat room (caseId)
        global.io.to(chat.caseId).emit('chat_accepted', {
          caseId: chat.caseId,
          adminId: authResult.userId,
          adminName: authResult.name || 'Admin',
          timestamp: new Date().toISOString(),
        })
        // Also emit agent_assigned for mobile clients listening for this event
        global.io.to(chat.caseId).emit('agent_assigned', {
          caseId: chat.caseId,
          agentName: authResult.name || 'Admin',
        })
      }
    } else if (action === 'close') {
      chat.status = 'CLOSED'
      chat.closedAt = new Date()

      chat.messages.push({
        content: 'This chat has been closed by the admin.',
        sender: authResult.userId,
        type: 'SYSTEM',
        timestamp: new Date(),
      })

      if (global.io) {
        global.io.to(chat.caseId).emit('chat_closed', {
          caseId: chat.caseId,
          adminId: authResult.userId,
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: accept, close' },
        { status: 400 }
      )
    }

    await chat.save()

    return NextResponse.json({
      success: true,
      message: `Chat ${action}ed successfully`,
      result: chat,
    })
  } catch (error) {
    console.error(`[ADMIN CHATS][PATCH] Error: ${error.message}`)
    return NextResponse.json({ error: 'Failed to update chat status' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
