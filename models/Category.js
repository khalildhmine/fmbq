import mongoose from 'mongoose'
import basePlugin from './base_model'

const CategorySchema = new mongoose.Schema(
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
    },
    parent: {
      type: mongoose.Types.ObjectId,
      ref: 'category',
      default: null, // Allow null values
    },
    image: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    colors: { type: Object },
    level: { type: Number, required: true },
    children: { type: Array },
    featured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'all'],
    },
    attributeFilters: [
      {
        name: String,
        values: [String],
      },
    ],
    brands: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'brand',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)
CategorySchema.plugin(basePlugin)
CategorySchema.post(/^find/, function (docs) {
  if (this.op === 'find') {
    docs.forEach(doc => {
      doc._id = doc._id.toString()
      doc.parent = doc.parent ? doc.parent.toString() : doc.parent
      // Convert brand IDs to strings if present
      if (doc.brands && doc.brands.length) {
        doc.brands = doc.brands.map(brand => (typeof brand === 'object' ? brand.toString() : brand))
      }
    })
  }
  if (this.op === 'findOne' && docs) {
    docs._id = docs._id.toString()
    docs.parent = docs.parent ? docs.parent.toString() : docs.parent
    // Convert brand IDs to strings if present
    if (docs.brands && docs.brands.length) {
      docs.brands = docs.brands.map(brand => (typeof brand === 'object' ? brand.toString() : brand))
    }
  }
})

const Category = mongoose.models.category || mongoose.model('category', CategorySchema)

export default Category
