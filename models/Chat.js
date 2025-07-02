import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    supportReason: {
      type: String,
      enum: ['URGENT_DELIVERY', 'GENERAL_SUPPORT', 'RETURN_ITEM', 'PRODUCT_INQUIRY'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'RESOLVED', 'CLOSED'],
      default: 'PENDING',
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['TEXT', 'SYSTEM', 'IMAGE'],
          default: 'TEXT',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        readBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    metadata: {
      createdAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
        index: true,
      },
      closedAt: Date,
      resolution: String,
      priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
      },
    },
  },
  {
    timestamps: true,
  }
)

// Middleware to update lastActivity on new messages
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.metadata.lastActivity = new Date()
  }
  next()
})

// Generate a unique case ID
chatSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    // Get count of chats created today for sequential numbering
    const todayStart = new Date(date.setHours(0, 0, 0, 0))
    const count = await this.constructor.countDocuments({
      'metadata.createdAt': { $gte: todayStart },
    })

    // Format: SUP-YYMMDD-XXXX (e.g., SUP-230915-0001)
    this.caseId = `SUP-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`
  }
  next()
})

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema)

export default Chat
