import mongoose from 'mongoose'
import { BaseModel } from './base_model'

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  },
  {
    timestamps: true,
  }
)

messageSchema.index({ roomId: 1, timestamp: -1 })

export const Message = BaseModel('Message', messageSchema)
