import mongoose from 'mongoose'

const feedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

const Feed = mongoose.models.Feed || mongoose.model('Feed', feedSchema)
export default Feed
