import mongoose from 'mongoose'

const sliderSchema = new mongoose.Schema(
  {
    category_id: {
      type: String,
      default: 'all',
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
    title: {
      type: String,
      required: true,
    },
    uri: {
      type: String,
      default: '#',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Slider || mongoose.model('Slider', sliderSchema)
