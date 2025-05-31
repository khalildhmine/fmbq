import mongoose from 'mongoose'
import basePlugin from './base_model'

const MaisonAdrarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide perfume name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify perfume type'],
      enum: ['body', 'house', 'other'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide perfume price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    description: {
      type: String,
      required: [true, 'Please provide perfume description'],
    },
    fullDescription: {
      type: String,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    mainImage: {
      type: String,
      required: [true, 'Please provide main image URL'],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    fragrance: {
      topNotes: [String],
      heartNotes: [String],
      baseNotes: [String],
    },
    volume: {
      type: String,
      required: [true, 'Please provide perfume volume'],
    },
    concentration: {
      type: String,
      required: [true, 'Please provide perfume concentration'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold count cannot be negative'],
    },
    sizes: [
      {
        volume: Number,
        price: Number,
        inStock: Number,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [String],
    isLimited: {
      type: Boolean,
      default: false,
    },
    launchDate: {
      type: Date,
      default: Date.now,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

MaisonAdrarSchema.plugin(basePlugin)

const MaisonAdrar = mongoose.models.maisonadrar || mongoose.model('maisonadrar', MaisonAdrarSchema)
export default MaisonAdrar
