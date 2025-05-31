import mongoose from 'mongoose'
import basePlugin from './base_model'

const VideoLikeSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaisonAdrarVideo',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
)

// Create a compound index on videoId and userId to ensure uniqueness
VideoLikeSchema.index({ videoId: 1, userId: 1 }, { unique: true })

VideoLikeSchema.plugin(basePlugin)

const VideoLike = mongoose.models.VideoLike || mongoose.model('VideoLike', VideoLikeSchema)

export default VideoLike
