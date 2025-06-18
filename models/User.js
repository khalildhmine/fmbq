import mongoose from 'mongoose'
import basePlugin from './base_model'

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
    address: {
      type: new mongoose.Schema(
        {
          street: { type: String, trim: true },
          province: { type: String, trim: true },
          city: { type: String, trim: true },
          area: { type: String, trim: true },
          postalCode: { type: String, trim: true },
        },
        { _id: false }
      ),
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: Date,
    isAdmin: {
      type: Boolean,
      default: false,
    },
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
  },
  {
    timestamps: true,
  }
)

// Virtual to get the active push token
userSchema.virtual('activePushToken').get(function () {
  return this.pushToken || this.expoPushToken || null
})

// Pre-save middleware to sync tokens
userSchema.pre('save', function (next) {
  if (this.expoPushToken && !this.pushToken) {
    this.pushToken = this.expoPushToken
  }
  if (this.pushToken && !this.expoPushToken) {
    this.expoPushToken = this.pushToken
  }
  next()
})

userSchema.plugin(basePlugin)

const User = mongoose.models.User || mongoose.model('User', userSchema)

// Migration function to sync tokens
export const migrateTokens = async () => {
  const users = await User.find({
    $or: [
      { expoPushToken: { $exists: true, $ne: null } },
      { pushToken: { $exists: true, $ne: null } },
    ],
  })

  for (const user of users) {
    const token = user.pushToken || user.expoPushToken
    if (token) {
      user.pushToken = token
      user.expoPushToken = token
      await user.save()
    }
  }
}

export default User
