import mongoose from 'mongoose'
import basePlugin from './base_model'

const OrderTimelineSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'status', 'note', 'payment', 'shipping'
  content: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
})

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      province: String,
      city: String,
      area: String,
      street: String,
      postalCode: String,
    },
    mobile: {
      type: String,
      required: true,
      default: '', // Add a default value
    },
    cart: [
      {
        productID: { type: String, required: true }, // Changed from ObjectId to String to handle composite IDs
        baseProductId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Final price after discounts
        originalPrice: { type: Number }, // Original price before discounts
        discount: { type: Number, default: 0 },
        name: { type: String, required: true },
        image: { type: String, required: true },
        color: {
          id: { type: String, default: 'default' },
          name: { type: String, default: 'Default' },
          hashCode: { type: String, default: '#000000' },
        },
        size: {
          id: { type: String, default: 'default' },
          size: { type: String, default: 'One Size' },
        },
        isMelhaf: {
          type: Boolean,
          default: false,
        },
        model: {
          type: String,
          enum: ['product', 'melhaf'],
          default: 'product',
        },
        variant: {
          type: String,
          required: false,
        },
      },
    ],
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        color: {
          id: String,
          name: String,
          hashCode: String,
        },
        size: {
          id: String,
          size: String,
        },
        image: String,
      },
    ],
    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true }, // Final price after all discounts
    subtotalBeforeDiscounts: { type: Number }, // Original total before discounts
    totalDiscount: { type: Number, required: true }, // Combined product discounts and coupon
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'pending_verification',
        'processing',
        'picked',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
      ],
      default: 'pending',
      required: true,
    },
    timeline: [OrderTimelineSchema],
    delivered: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    dateOfPayment: Date,
    coupon: {
      code: String,
      discount: Number,
      originalTotal: Number,
      discountedTotal: Number,
      type: mongoose.Schema.Types.Mixed, // Allow it to be null
    },
    shippingAddress: {
      street: String,
      area: String,
      city: String,
      province: String,
      postalCode: String,
    },
    tracking: [
      {
        status: String,
        date: Date,
        location: String,
        description: String,
      },
    ],
    paymentVerification: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      image: String,
      verifiedAt: Date,
      verificationNote: String,
      transactionId: String,
      amount: {
        type: Number,
        required: function () {
          return this.paymentMethod === 'bank_transfer'
        },
      },
    },
    brand: {
      type: mongoose.Schema.Types.Mixed, // Allows both string and object
      required: false,
      validate: {
        validator: function (v) {
          return typeof v === 'string' || (typeof v === 'object' && v !== null && v.name)
        },
        message: 'Brand must be either a string or an object with a name property',
      },
    },
  },
  { timestamps: true }
)

// Add method to validate status transitions
OrderSchema.methods.canTransitionTo = function (newStatus) {
  const validTransitions = {
    pending: ['processing', 'pending_verification', 'cancelled'],
    pending_verification: ['processing', 'picked', 'cancelled'],
    processing: ['picked', 'shipped', 'cancelled'],
    picked: ['delivered', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }

  return validTransitions[this.status]?.includes(newStatus)
}

// Add method to update status with timeline
OrderSchema.methods.updateStatus = async function (newStatus, userId) {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error('Invalid status transition')
  }

  this.status = newStatus
  this.timeline.push({
    type: 'status',
    content: `Order ${newStatus}`,
    userId: userId,
  })

  if (newStatus === 'delivered') {
    this.delivered = true
  }

  if (newStatus === 'completed') {
    await this.updateProductSales()
  }

  return this.save()
}

OrderSchema.methods.updateProductSales = async function () {
  if (this.status === 'completed') {
    try {
      for (const item of this.cart) {
        const product = await mongoose.model('Product').findById(item.baseProductId)
        if (product) {
          await product.updateSales(item.quantity, item.price)
        }
      }
    } catch (error) {
      console.error('Error updating product sales:', error)
    }
  }
}

// Generate unique order ID before saving
OrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    this.orderId = `ORD-${timestamp}-${random}`
  }
  next()
})

// Add middleware to ensure data consistency
OrderSchema.pre('save', function (next) {
  // Ensure brand is properly formatted
  if (this.brand && typeof this.brand === 'object' && !this.brand.name) {
    this.brand = null
  }

  // Ensure payment verification has proper defaults
  if (!this.paymentVerification) {
    this.paymentVerification = {
      transactionDetails: {
        verificationStatus: 'pending',
      },
    }
  }

  next()
})

// Add virtual for formatted amount
OrderSchema.virtual('formattedAmount').get(function () {
  if (!this.paymentVerification?.transactionDetails?.amount) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(this.paymentVerification.transactionDetails.amount)
})

OrderSchema.plugin(basePlugin)

// Force mongoose to use this updated schema
mongoose.models = {}

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export default Order
