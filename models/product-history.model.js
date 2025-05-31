import mongoose from 'mongoose'

const productHistorySchema = new mongoose.Schema(
  {
    userId: {
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
  },
  {
    timestamps: true,
  }
)

// Create compound index for userId and productId
productHistorySchema.index({ userId: 1, productId: 1 }, { unique: true })

const ProductHistory =
  mongoose.models.ProductHistory || mongoose.model('ProductHistory', productHistorySchema)
export default ProductHistory
