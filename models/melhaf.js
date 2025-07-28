import mongoose from 'mongoose'

const MelhafSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Persi', 'Japan', 'Diana London'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      averageScore: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    promotion: {
      isActive: {
        type: Boolean,
        default: false,
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
      },
      discountValue: {
        type: Number,
        min: 0,
        default: 0,
      },
      startDate: Date,
      endDate: Date,
    },
    images: [
      {
        url: String,
        public_id: String,
        isMain: { type: Boolean, default: false },
      },
    ],
    sizes: [
      {
        size: String,
        inStock: {
          type: Number,
          default: 0,
        },
      },
    ],
    features: [String],
    materials: [String],
    colors: [
      {
        name: String,
        code: String,
        images: [String],
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'coming_soon'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    specifications: {
      weight: String,
      dimensions: String,
      fabric: String,
      style: String,
      occasion: String,
    }
  },
  {
    timestamps: true,
  }
)

// Add virtual for calculating discounted price
MelhafSchema.virtual('finalPrice').get(function () {
  if (!this.promotion?.isActive) return this.price

  const now = new Date()
  if (this.promotion.startDate && now < this.promotion.startDate) return this.price
  if (this.promotion.endDate && now > this.promotion.endDate) return this.price

  if (this.promotion.discountType === 'percentage') {
    return this.price * (1 - this.promotion.discountValue / 100)
  }
  return Math.max(0, this.price - this.promotion.discountValue)
})

export default mongoose.models.Melhaf || mongoose.model('Melhaf', MelhafSchema)
