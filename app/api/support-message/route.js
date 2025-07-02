import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/db'
import Chat from '../../../models/Chat'
import { verifyAuth } from '../../../lib/auth'

// Initialize chat room
export async function POST(req) {
  try {
    // Verify authentication using the auth lib implementation
    const authResult = await verifyAuth(req)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authResult.id

    await connectToDatabase()
    const { supportReason } = await req.json()

    if (!supportReason) {
      return NextResponse.json({ error: 'Support reason is required' }, { status: 400 })
    }

    // Validate support reason
    const validSupportReasons = [
      'URGENT_DELIVERY',
      'GENERAL_SUPPORT',
      'RETURN_ITEM',
      'PRODUCT_INQUIRY',
    ]
    if (!validSupportReasons.includes(supportReason)) {
      return NextResponse.json(
        {
          error: `Invalid support reason. Must be one of: ${validSupportReasons.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Generate case ID (format: SUP-YYMMDD-XXXX)
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    // Get count of chats created today for sequential numbering
    const todayStart = new Date(date.setHours(0, 0, 0, 0))
    const count = await Chat.countDocuments({
      'metadata.createdAt': { $gte: todayStart },
    })

    // Format: SUP-YYMMDD-XXXX (e.g., SUP-230915-0001)
    const caseId = `SUP-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`

    const chat = await Chat.create({
      caseId,
      userId,
      supportReason,
      status: 'PENDING',
      messages: [
        {
          sender: userId, // Set the sender as the user creating the chat
          content: `Support chat started for ${supportReason}`,
          type: 'SYSTEM',
          timestamp: new Date(),
          readBy: [userId],
        },
      ],
      metadata: {
        createdAt: new Date(),
        lastActivity: new Date(),
        priority: 'MEDIUM',
      },
    })

    // Log the data sent to the DB for debugging
    console.log('[SUPPORT-MESSAGE][POST] Chat created in DB:', {
      caseId: chat.caseId,
      userId: chat.userId,
      supportReason: chat.supportReason,
      status: chat.status,
      messages: chat.messages,
      metadata: chat.metadata,
    })

    // Emit socket event for admin notification
    global.io?.emit('new_support_request', {
      caseId: chat.caseId,
      userId: userId,
      supportReason,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: {
        caseId: chat.caseId,
        messages: chat.messages,
        chat: chat, // Include the full chat object for debugging
      },
    })
  } catch (error) {
    console.error('Support chat creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create support chat',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Get chat history or specific chat
export async function GET(req) {
  try {
    await connectToDatabase()
    const authResult = await verifyAuth(req)

    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')

    let query = {}

    // If not admin, they can only see their own chats
    if (!authResult.isAdmin) {
      query.userId = authResult.id
    }

    // If caseId is provided, get specific chat
    if (caseId) {
      query.caseId = caseId
    }

    const chats = await Chat.find(query)
      .sort({ 'metadata.lastActivity': -1 })
      .populate('userId', 'name email')
      .populate('assignedAgent', 'name email')
      .exec()

    return NextResponse.json({
      success: true,
      data: chats,
    })
  } catch (error) {
    console.error('Error fetching support chats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support chats' },
      { status: error.status || 500 }
    )
  }
}

// Update chat status or assign agent
export async function PATCH(req) {
  try {
    await connectToDatabase()
    const authResult = await verifyAuth(req)

    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { caseId, status, assignAgent } = body

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }

    const chat = await Chat.findOne({ caseId })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Only admins can update status or assign agents
    if (!authResult.isAdmin && (status || assignAgent)) {
      return NextResponse.json({ error: 'Unauthorized action' }, { status: 403 })
    }

    if (status) {
      chat.status = status
      if (status === 'RESOLVED' || status === 'CLOSED') {
        chat.metadata.closedAt = new Date()
      }
    }

    if (assignAgent) {
      chat.assignedAgent = authResult.id
      chat.status = 'ACTIVE'

      // Add system message about agent assignment
      chat.messages.push({
        sender: authResult.id,
        content: `${authResult.user.name} has joined the chat`,
        type: 'SYSTEM',
      })

      // Emit socket event for user notification
      global.io?.to(chat.caseId).emit('agent_assigned', {
        caseId: chat.caseId,
        agentName: authResult.user.name,
      })
    }

    await chat.save()

    return NextResponse.json({
      success: true,
      data: chat,
    })
  } catch (error) {
    console.error('Error updating support chat:', error)
    return NextResponse.json(
      { error: 'Failed to update support chat' },
      { status: error.status || 500 }
    )
  }
}
