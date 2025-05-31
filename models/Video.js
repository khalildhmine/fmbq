import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  perfumeName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['promotional', 'tutorial', 'review', 'behind-the-scenes'],
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
videoSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema)

export default Video
