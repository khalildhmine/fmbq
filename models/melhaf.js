// models/melhaf.js
import mongoose from 'mongoose'

// Sub-schema for each color variant
const ColorVariantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, default: 0, min: 0 },
  price: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
}, { _id: false }) // Disable auto _id for subdocuments

// Sub-schema for promotions
const PromotionSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, min: 0, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
})

// Sub-schema for sizes
const SizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  inStock: { type: Number, default: 0, min: 0 },
})

// Main Melhaf schema
const MelhafSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String },
    category: { type: String, default: 'Melhafa' },
    collectionName: { type: String, required: true }, // Keep this for database
    adFabric: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    colorVariants: [ColorVariantSchema],
    targetAudience: { type: String, default: 'Women' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Transform collectionName to collection in the output
        ret.collection = ret.collectionName
        return ret
      },
    },
    toObject: { virtuals: true },
  }
)

// Virtual for calculating discounted price
MelhafSchema.virtual('finalPrice').get(function () {
  if (!this.promotion?.isActive || !this.colorVariants[0]?.price) {
    return this.colorVariants[0]?.price || 0
  }

  const now = new Date()
  if (this.promotion.startDate && now < this.promotion.startDate) {
    return this.colorVariants[0].price
  }
  if (this.promotion.endDate && now > this.promotion.endDate) {
    return this.colorVariants[0].price
  }

  const price = this.colorVariants[0].price
  if (this.promotion.discountType === 'percentage') {
    return price * (1 - this.promotion.discountValue / 100)
  }
  return Math.max(0, price - this.promotion.discountValue)
})

// Ensure virtuals are included in JSON output
MelhafSchema.set('toJSON', { virtuals: true })

export default mongoose.models.Melhaf || mongoose.model('Melhaf', MelhafSchema)
MelhafSchema.set('toJSON', { virtuals: true })
