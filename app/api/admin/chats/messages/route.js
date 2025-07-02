import { apiHandler, setJson } from '@/helpers/api'
import { chatRepo } from '@/helpers/db-repo'

export const POST = apiHandler(async req => {
  const body = await req.json()

  // Defensive: Ensure chatId is present and is a string
  let chatId = body.chatId
  if (!chatId) {
    return setJson(
      {
        success: false,
        message: 'chatId is required',
        error: 'Missing chatId',
      },
      { status: 400 }
    )
  }
  // Fix: If chatId is an object (e.g., ObjectId), convert to string safely
  if (typeof chatId !== 'string') {
    try {
      if (chatId && typeof chatId === 'object' && chatId.toHexString) {
        chatId = chatId.toHexString()
      } else if (chatId && chatId.toString) {
        chatId = chatId.toString()
      } else {
        chatId = String(chatId)
      }
    } catch {
      return setJson(
        {
          success: false,
          message: 'chatId must be a string or convertible to string',
          error: 'Invalid chatId',
        },
        { status: 400 }
      )
    }
  }

  console.log('[ADMIN CHATS MESSAGE][POST] Received admin message:', {
    chatId,
    content: body.content?.substring(0, 50),
  })

  try {
    // Save the admin reply
    const result = await chatRepo.addAdminReply(chatId, {
      content: body.content,
      replyTo: body.replyTo,
    })

    if (!result || !result.success) {
      throw new Error(result?.error || 'Failed to save message')
    }

    // Defensive: Ensure result.message is present
    const messageObj = result.message || null

    // Defensive: Verify chatId is a string
    let chatIdStr = chatId
    if (typeof chatIdStr !== 'string') {
      if (chatIdStr && typeof chatIdStr === 'object' && chatIdStr.toHexString) {
        chatIdStr = chatIdStr.toHexString()
      } else if (chatIdStr && chatIdStr.toString) {
        chatIdStr = chatIdStr.toString()
      } else {
        chatIdStr = String(chatIdStr)
      }
    }

    // Verify message was stored
    const verifiedChat = await chatRepo.verifyMessages(chatIdStr)

    return setJson({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: messageObj,
        messageCount: verifiedChat?.messages?.length || 0,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[ADMIN CHATS MESSAGE][POST] Error:', error)
    return setJson(
      {
        success: false,
        message: error.message || 'Failed to send message',
        error: error.message,
      },
      { status: 500 }
    )
  }
})

export const dynamic = 'force-dynamic'
