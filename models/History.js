import mongoose from 'mongoose'
// Replace with direct Product model import
import Product from './Product'

const HistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    lastViewed: {
      type: Date,
      default: Date.now,
    },
    viewCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Create compound index for user and productId to ensure uniqueness
HistorySchema.index({ user: 1, productId: 1 }, { unique: true })

const History = mongoose.models.History || mongoose.model('History', HistorySchema)

console.log('History model created:', History) // Log model creation

export default History
