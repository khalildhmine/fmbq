import mongoose from 'mongoose'
import basePlugin from './base_model'

const MaisonAdrarVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide video title'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify video type'],
      enum: ['Persi', 'Japan', 'Diana London', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please provide video description'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Please provide video URL'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Please provide thumbnail URL'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide video duration in seconds'],
      min: [1, 'Duration must be at least 1 second'],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    perfumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaisonAdrar',
    },
    perfumeName: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
  },
  { timestamps: true }
)

// Add indexes for common queries
MaisonAdrarVideoSchema.index({ type: 1, createdAt: -1 })
MaisonAdrarVideoSchema.index({ featured: 1 })
MaisonAdrarVideoSchema.index({ perfumeId: 1 })

MaisonAdrarVideoSchema.plugin(basePlugin)

const MaisonAdrarVideo =
  mongoose.models.MaisonAdrarVideo || mongoose.model('MaisonAdrarVideo', MaisonAdrarVideoSchema)

export default MaisonAdrarVideo
