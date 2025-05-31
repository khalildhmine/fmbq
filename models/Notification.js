import mongoose from 'mongoose'
import basePlugin from './base_model'

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all',
    },
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    link: {
      type: String,
      trim: true,
    },
    scheduledFor: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'sent', 'failed'],
      default: 'pending',
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    sentAt: Date,
  },
  {
    timestamps: true,
  }
)

notificationSchema.plugin(basePlugin)

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
