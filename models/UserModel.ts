import mongoose, { Document, Schema, Model } from 'mongoose'
import basePlugin from './base_model'

// Define the Address schema
const addressSchema = new Schema({
  streetAddress: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String },
  postalCode: { type: String, default: '0000' },
  updatedAt: { type: Date, default: Date.now },
})

// Define the NotificationSettings interface
interface NotificationSettings {
  enabled: boolean
  expoPushToken: string | null
  updatedAt: Date
}

// Define the User interface
export interface IUser extends Document {
  name: string
  email: string
  mobile?: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  isVerified: boolean
  lastLoginAt?: Date
  isAdmin: boolean
  address?: typeof addressSchema
  addresses?: typeof addressSchema[]
  notificationsEnabled: boolean
  expoPushToken?: string | null
  pushToken?: string | null
  notificationSettings?: NotificationSettings
  coins: number
  coinsHistory: {
    amount: number
    type: 'earned' | 'spent' | 'expired' | 'adjusted'
    orderId?: mongoose.Types.ObjectId
    description?: string
    createdAt: Date
  }[]
  redeemCoins(amount: number, orderId?: mongoose.Types.ObjectId): Promise<void>
  updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<IUser>
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    mobile: { type: String, trim: true, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
    isAdmin: { type: Boolean, default: false },
    address: addressSchema,
    addresses: [addressSchema],
    notificationsEnabled: { type: Boolean, default: true },
    expoPushToken: { type: String, default: null },
    pushToken: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string | null) {
          return v === null || v.startsWith('ExponentPushToken[') || v.startsWith('ExpoPushToken[')
        },
        message: (props: { value: string }) => `${props.value} is not a valid Expo push token`,
      },
    },
    notificationSettings: {
      enabled: { type: Boolean, default: false },
      expoPushToken: { type: String, default: null },
      updatedAt: { type: Date, default: Date.now },
    },
    coins: { type: Number, default: 0 },
    coinsHistory: [
      {
        amount: Number,
        type: { type: String, enum: ['earned', 'spent', 'expired', 'adjusted'] },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        description: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

// Add methods to the schema
userSchema.methods.redeemCoins = async function (amount: number, orderId?: mongoose.Types.ObjectId) {
  if (!amount || amount <= 0) return
  this.coins = Math.max(0, (this.coins || 0) - amount)
  this.coinsHistory.push({
    amount: -Math.abs(amount),
    type: 'spent',
    orderId,
    description: 'Coins redeemed for order',
    createdAt: new Date(),
  })
  await this.save()
}

userSchema.methods.updateNotificationSettings = async function (
  settings: Partial<NotificationSettings>
): Promise<IUser> {
  if (settings.enabled !== undefined) {
    this.notificationSettings = this.notificationSettings || {}
    this.notificationSettings.enabled = settings.enabled
    this.notificationsEnabled = settings.enabled
  }
  if (settings.expoPushToken !== undefined) {
    this.notificationSettings = this.notificationSettings || {}
    this.notificationSettings.expoPushToken = settings.expoPushToken
    this.expoPushToken = settings.expoPushToken
    this.pushToken = settings.expoPushToken
  }
  this.notificationSettings.updatedAt = new Date()
  return await this.save()
}

// Apply the base plugin
userSchema.plugin(basePlugin)

// Ensure the model is only compiled once
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
