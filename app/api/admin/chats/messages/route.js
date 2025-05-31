import { apiHandler, setJson } from '@/helpers/api'
import { chatRepo } from '@/helpers/db-repo'

export const POST = apiHandler(async req => {
  const body = await req.json()

  console.log('[Chat API] Received admin message:', {
    chatId: body.chatId,
    content: body.content?.substring(0, 50),
  })

  try {
    // Save the admin reply
    const result = await chatRepo.addAdminReply(body.chatId, {
      content: body.content,
      replyTo: body.replyTo,
    })

    if (!result.success) {
      throw new Error('Failed to save message')
    }

    // Verify message was stored
    const verifiedChat = await chatRepo.verifyMessages(body.chatId)

    return setJson({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: result.message,
        messageCount: verifiedChat?.messages?.length || 0,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[Chat API] Error saving message:', error)
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
