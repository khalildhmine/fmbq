import mongoose from 'mongoose'
import basePlugin from './base_model'

const addressSchema = new mongoose.Schema({
  streetAddress: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String },
  postalCode: { type: String, default: '0000' },
  updatedAt: { type: Date, default: Date.now },
})

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    // address: {
    //   type: new mongoose.Schema(
    //     {
    //       street: { type: String, trim: true },
    //       province: { type: String, trim: true },
    //       city: { type: String, trim: true },
    //       area: { type: String, trim: true },
    //       postalCode: { type: String, trim: true },
    //     },
    //     { _id: false }
    //   ),
    //   default: null,
    // },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: Date,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Add push notification tokens field
    pushTokens: {
      type: [String],
      default: [],
    },

    // THIS IS THE ADDRESSES :
    address: addressSchema,
    addresses: [addressSchema],

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    // Keep both fields for backward compatibility
    expoPushToken: {
      type: String,
      default: null,
    },
    pushToken: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v.startsWith('ExponentPushToken[') || v.startsWith('ExpoPushToken[')
        },
        message: props => `${props.value} is not a valid Expo push token`,
      },
    },
    notificationSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      expoPushToken: {
        type: String,
        default: null,
      },
    },
    // Add coins field for reward points
    coins: {
      type: Number,
      default: 0,
    },
    // Add coinsHistory to track changes
    coinsHistory: [
      {
        amount: Number,
        type: {
          type: String,
          enum: ['earned', 'spent', 'expired', 'adjusted'],
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Virtual to get the active push token
userSchema.virtual('activePushToken').get(function () {
  return this.pushToken || this.expoPushToken || null
})

// Apply the base plugin
userSchema.plugin(basePlugin)

// Pre-save middleware to sync tokens
userSchema.pre('save', function (next) {
  if (this.isModified('expoPushToken') && !this.pushToken) {
    this.pushToken = this.expoPushToken
  }
  if (this.isModified('pushToken') && !this.expoPushToken) {
    this.expoPushToken = this.pushToken
  }
  next()
})

// Add a method to update coins when an order is placed
userSchema.methods.redeemCoins = async function (amount, orderId) {
  if (!amount || amount <= 0) return
  this.coins = Math.max(0, (this.coins || 0) - amount)
  this.coinsHistory = this.coinsHistory || []
  this.coinsHistory.push({
    amount: -Math.abs(amount),
    type: 'spent',
    orderId,
    description: 'Coins redeemed for order',
    createdAt: new Date(),
  })
  await this.save()
}

// Static method to update push token for a user
userSchema.statics.updatePushToken = async function (userId, token) {
  if (!userId || !token) return null
  return await this.findByIdAndUpdate(
    userId,
    {
      expoPushToken: token,
      pushToken: token,
      'notificationSettings.expoPushToken': token,
      'notificationSettings.enabled': true,
      notificationsEnabled: true,
    },
    { new: true }
  )
}

// Ensure the model is only compiled once
const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
