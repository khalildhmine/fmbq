import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [15, 'Coupon code cannot be more than 15 characters'],
    },
    discount: {
      type: Number,
      required: [true, 'Please provide a discount percentage'],
      min: [0, 'Discount cannot be less than 0'],
      max: [100, 'Discount cannot be more than 100'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Please provide an expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    isLimitedToFirstTimeUsers: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// Check if coupon is valid
couponSchema.methods.isValid = function (user, cartTotal) {
  const now = new Date()

  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is not active' }
  }

  // Check if coupon is expired
  if (this.expiresAt < now) {
    return { valid: false, message: 'This coupon has expired' }
  }

  // Check if coupon has reached max uses
  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    return { valid: false, message: 'This coupon has reached its maximum usage limit' }
  }

  // Check minimum purchase amount
  if (this.minAmount > 0 && cartTotal < this.minAmount) {
    return {
      valid: false,
      message: `This coupon requires a minimum purchase of ${this.minAmount} MRU`,
    }
  }

  // Check if coupon is limited to first-time users
  if (this.isLimitedToFirstTimeUsers && user && user.orders && user.orders.length > 0) {
    return { valid: false, message: 'This coupon is for first-time customers only' }
  }

  // Check if user has already used this coupon
  if (user && this.usedBy.includes(user._id)) {
    return { valid: false, message: 'You have already used this coupon' }
  }

  return { valid: true }
}

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt
})

// Create a compound index for efficient queries
couponSchema.index({ code: 1 })
couponSchema.index({ isActive: 1, expiresAt: 1 })

// Only create the model if it doesn't exist already
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)

export default Coupon
