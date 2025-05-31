import mongoose from 'mongoose'
import basePlugin from './base_model'

const VideoCommentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaisonAdrarVideo',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likes: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoComment',
      default: null,
    },
    isAdminReply: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
)

// Add indexes for common queries
VideoCommentSchema.index({ videoId: 1, createdAt: -1 })
VideoCommentSchema.index({ parentId: 1 })
VideoCommentSchema.index({ userId: 1 })

VideoCommentSchema.plugin(basePlugin)

const VideoComment =
  mongoose.models.VideoComment || mongoose.model('VideoComment', VideoCommentSchema)

export default VideoComment
