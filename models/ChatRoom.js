import mongoose from 'mongoose'
import { BaseModel } from './base_model'

const chatRoomSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    subject: { type: String, required: true },
    lastMessage: { type: Date },
    unreadCount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
)

export const ChatRoom = BaseModel('ChatRoom', chatRoomSchema)
