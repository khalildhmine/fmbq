import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    sender: {
      id: String,
      name: String,
      role: {
        type: String,
        enum: ['user', 'admin', 'system'],
        required: true,
        default: 'user',
      },
    },
    content: String,
    type: { type: String, default: 'text' },
    timestamp: { type: Date, default: Date.now },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
    thread: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    metadata: {
      device: String,
      location: String,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
)

// Add method to format messages
messageSchema.methods.toJSON = function () {
  const obj = this.toObject()
  return {
    ...obj,
    isAdmin: obj.sender?.role === 'admin',
  }
}

// Add virtual for message styling
messageSchema.virtual('messageStyle').get(function () {
  return {
    isAdmin: this.sender?.role === 'admin',
    alignment: this.sender?.role === 'admin' ? 'right' : 'left',
    backgroundColor: this.sender?.role === 'admin' ? 'bg-blue-500' : 'bg-gray-100',
    textColor: this.sender?.role === 'admin' ? 'text-white' : 'text-gray-900',
  }
})

// Add a static method to find chat messages
messageSchema.statics.findByRole = function (role) {
  return this.find({ 'sender.role': role })
}

const chatSchema = new mongoose.Schema(
  {
    chatId: String,
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'],
      default: 'active',
    },
    // Support both old and new format
    sender: {
      id: String,
      name: String,
      role: String,
    },
    content: String,
    participants: [
      {
        id: String,
        name: String,
        role: String,
      },
    ],
    messages: [messageSchema],
    timestamp: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
    lastMessage: {
      content: String,
      timestamp: Date,
      sender: String,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow flexibility for migration
  }
)

// Update message count and last activity
chatSchema.pre('save', function (next) {
  if (this.isModified('messages')) {
    this.messageCount = this.messages.length
    this.lastActivity = new Date()
    const lastMsg = this.messages[this.messages.length - 1]
    if (lastMsg) {
      this.lastMessage = {
        content: lastMsg.content,
        timestamp: lastMsg.timestamp,
        sender: lastMsg.sender.role,
      }
    }
  }
  next()
})

// Add indexes
chatSchema.index({ timestamp: -1 })
chatSchema.index({ 'sender.id': 1 })
chatSchema.index({ chatId: 1 })

const Chat = mongoose.models.chat || mongoose.model('chat', chatSchema)
export default Chat
