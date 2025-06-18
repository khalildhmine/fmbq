import mongoose from 'mongoose'
import basePlugin from './base_model'

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Brand name must be at least 2 characters long'],
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
        },
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      },
    },
    logo: {
      type: String,
      required: [true, 'Logo URL is required'],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v)
        },
        message: 'Logo must be a valid URL',
      },
    },
    color: {
      type: String,
      default: '#000000',
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6})$/.test(v)
        },
        message: 'Color must be a valid hex color code (e.g., #FF0000)',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: 'Website must be a valid URL',
      },
    },
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'category',
      },
    ],
    heroImage: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: 'Hero image must be a valid URL',
      },
    },
    bannerImage: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v)
        },
        message: 'Banner image must be a valid URL',
      },
    },
    meta: {
      title: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      keywords: [
        {
          type: String,
          trim: true,
          maxlength: [50, 'Each keyword cannot exceed 50 characters'],
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

BrandSchema.plugin(basePlugin)

// Pre-save middleware to ensure slug format
BrandSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

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
