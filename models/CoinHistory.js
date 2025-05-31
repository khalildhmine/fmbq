import mongoose from 'mongoose'
import basePlugin from './base_model'

const CoinHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['order_completion', 'coupon_redemption', 'admin_adjustment'],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
)

CoinHistorySchema.plugin(basePlugin)
const CoinHistory = mongoose.models.coinHistory || mongoose.model('coinHistory', CoinHistorySchema)

export default CoinHistory
