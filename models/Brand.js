import mongoose from 'mongoose'
import basePlugin from './base_model'

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isInFeed: {
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
    website: {
      type: String,
      trim: true,
    },
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'category',
      },
    ],
    heroImage: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    // Store meta information for SEO
    meta: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  },
  { timestamps: true }
)

BrandSchema.plugin(basePlugin)

// Convert ObjectIDs to strings for consistency
BrandSchema.post(/^find/, function (docs) {
  if (this.op === 'find') {
    docs.forEach(doc => {
      doc._id = doc._id.toString()
      if (doc.categories && doc.categories.length) {
        doc.categories = doc.categories.map(cat => (typeof cat === 'object' ? cat.toString() : cat))
      }
    })
  }
  if (this.op === 'findOne' && docs) {
    docs._id = docs._id.toString()
    if (docs.categories && docs.categories.length) {
      docs.categories = docs.categories.map(cat => (typeof cat === 'object' ? cat.toString() : cat))
    }
  }
})

const Brand = mongoose.models.brand || mongoose.model('brand', BrandSchema)

export default Brand
