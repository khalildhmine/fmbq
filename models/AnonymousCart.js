import mongoose from 'mongoose'

const anonymousCartSchema = new mongoose.Schema(
  {
    cartId: {
      type: String,
      required: false,
      unique: true,
      index: true,
    },
    userId: { type: String, required: false, index: true },
    contactInfo: {
      email: { type: String, default: null },
      phone: { type: String, default: null },
      name: { type: String, default: null },
      deviceOS: { type: String, default: null }, // <-- added device OS info
      deviceModel: { type: String, default: null }, // <-- added device model info
    },
    items: [
      {
        _id: { type: String, required: false },
        itemID: { type: String, required: false },
        productID: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: false },
        finalPrice: { type: Number, required: false },
        discount: { type: Number, required: false },
        quantity: { type: Number, required: true },
        image: { type: String, required: false },
        inStock: { type: Number, required: false },
        color: {
          name: { type: String, required: false },
          hashCode: { type: String, required: false },
        },
        size: {
          size: { type: String, required: false },
          id: { type: String, required: false },
          name: { type: String, required: false },
        },
        variantId: { type: String, required: false }, // Add variantId field
        action: {
          type: String,
          enum: ['add', 'remove'],
          default: 'add',
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

anonymousCartSchema.index({ updatedAt: -1 })
anonymousCartSchema.index({ email: 1 })

const AnonymousCart =
  mongoose.models.AnonymousCart || mongoose.model('AnonymousCart', anonymousCartSchema)

export default AnonymousCart
