import mongoose from 'mongoose'
import { connect } from '@/helpers/db'
import { Chat } from '@/models'
import { User } from '@/models'

export const chatRepo = {
  async create({ participants, type = 'support', metadata = {} }) {
    await connect()
    const chat = new Chat({
      participants,
      type,
      metadata,
    })
    await chat.save()
    return chat
  },

  async getByUserId(userId, query = {}) {
    await connect()
    const userObjectId = new mongoose.Types.ObjectId(userId)
    return Chat.find({
      participants: userId,
      ...query,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email avatar')
  },

  async addMessage(chatId, message) {
    await connect()
    const chat = await Chat.findById(chatId)
    if (!chat) throw new Error('Chat not found')

    chat.messages.push(message)
    chat.lastMessage = message
    chat.unreadCount += 1

    await chat.save()
    return chat
  },

  async markAsRead(chatId, userId) {
    await connect()
    const chat = await Chat.findById(chatId)
    if (!chat) throw new Error('Chat not found')

    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true
        msg.readAt = new Date()
      }
    })
    chat.unreadCount = 0

    await chat.save()
    return chat
  },

  async getActive() {
    await connect()
    return Chat.find({ status: 'active' })
      .populate('participants', 'name email avatar')
      .sort({ updatedAt: -1 })
      .lean()
  },

  async getById(chatId) {
    await connect()
    return Chat.findById(chatId).populate('participants', 'name email avatar').lean()
  },

  async closeChat(chatId) {
    await connect()
    return Chat.findByIdAndUpdate(
      chatId,
      {
        status: 'closed',
        closedAt: new Date(),
      },
      { new: true }
    )
  },

  async reopenChat(chatId) {
    await connect()
    return Chat.findByIdAndUpdate(
      chatId,
      {
        status: 'open',
        closedAt: null,
      },
      { new: true }
    )
  },

  async addAdminReply(chatId, { content, replyTo }) {
    await connect()
    const chat = await Chat.findById(chatId)
    if (!chat) throw new Error('Chat not found')

    const message = {
      content,
      sender: {
        role: 'admin',
        name: 'Admin',
      },
      timestamp: new Date(),
      replyTo,
      status: 'sent',
      deliveryStatus: 'sent',
    }

    try {
      chat.messages.push(message)
      chat.lastMessage = {
        content,
        timestamp: new Date(),
        sender: 'admin',
      }
      await chat.save()

      return {
        message,
        chat,
        success: true,
      }
    } catch (error) {
      console.error('[Chat Repo] Error saving admin reply:', error)
      throw new Error('Failed to save admin reply: ' + error.message)
    }
  },

  async verifyMessages(chatId) {
    await connect()
    return Chat.findById(chatId).select('messages').lean()
  },
}
