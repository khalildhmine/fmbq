import mongoose from 'mongoose'

const pushTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    anonymousId: {
      type: String,
      required: false,
    },
    deviceInfo: {
      brand: String,
      modelName: String,
      osName: String,
      osVersion: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

const PushToken = mongoose.models.PushToken || mongoose.model('PushToken', pushTokenSchema)
export default PushToken
