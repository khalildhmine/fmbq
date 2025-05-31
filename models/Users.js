import mongoose from 'mongoose'
import basePlugin from './base_model'

const UserSchema = new mongoose.Schema(
  {
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    root: { type: Boolean, default: false },
    coins: { type: Number, default: 0 }, // Ensure this field is present
    address: {
      type: {
        postalCode: {
          type: String,
        },
        street: {
          type: String,
        },
        area: {
          code: {
            type: String,
          },
          name: {
            type: String,
          },
          cityCode: {
            type: String,
          },
          provinceCode: {
            type: String,
          },
        },
        city: {
          code: {
            type: String,
          },
          name: {
            type: String,
          },
          provinceCode: {
            type: String,
          },
        },
        province: {
          code: {
            type: String,
          },
          name: {
            type: String,
          },
        },
      },
      required: false,
    },
    mobile: { type: String },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
      },
    ],
    unreadMessages: {
      type: Number,
      default: 0,
    },
    lastChatActivity: Date,
  },
  { timestamps: true }
)

UserSchema.plugin(basePlugin)
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
