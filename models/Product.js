import mongoose from 'mongoose'
import Brand from './Brand'

const sizeSchema = new mongoose.Schema({
  id: String,
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
})

const productVariantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  size: String,
  color: {
    id: String,
    name: String,
    hashCode: String,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && v >= 0
      },
      message: 'Stock must be a non-negative integer',
    },
  },
  price: {
    type: Number,
    min: 0,
  },
  images: [String],
})

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'brand',
    },
    images: [
      {
        url: String,
      },
    ],
    inStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: String,
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    sizes: {
      type: [
        {
          id: String,
          size: String,
          stock: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      default: [],
    },
    colors: {
      type: [
        {
          id: String,
          name: String,
          hashCode: String,
          stock: {
            type: Number,
            default: 0,
          },
          images: [String],
        },
      ],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
    },
    info: [
      {
        title: String,
        value: String,
      },
    ],
    specification: [
      {
        title: String,
        value: String,
      },
    ],
    optionsType: {
      type: String,
      enum: ['none', 'size', 'color', 'both'],
      default: 'none',
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
      },
    ],
    categoryHierarchy: {
      mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
      },
      subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
      },
      leafCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
      },
    },
    slug: {
      type: String,
      unique: true,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // Add index for better query performance
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Add indexes for filtering optimization
productSchema.index({ price: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ 'categoryHierarchy.mainCategory': 1 })
productSchema.index({ 'categoryHierarchy.subCategory': 1 })
productSchema.index({ category: 1 })
productSchema.index({ sold: -1 })
productSchema.index({ inStock: 1 }) // For filtering by stock availability
productSchema.index({ discount: -1 }) // For filtering discounted products (higher discount first)
productSchema.index({ createdAt: -1 }) // For 'latest' sorting
productSchema.index({ 'colors.name': 1 }) // For filtering by color name (multikey index)
productSchema.index({ 'sizes.size': 1 }) // For filtering by size value (multikey index)
productSchema.index({ 'categoryHierarchy.leafCategory': 1 }) // For filtering by leaf category

// Add method to calculate total stock
productSchema.methods.calculateTotalStock = function () {
  if (this.variants && this.variants.length > 0) {
    // If using variants, sum up variant stock
    return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0)
  }

  // If using separate sizes/colors
  if (this.optionsType === 'both') {
    // For combined options, use the minimum available combination
    let totalStock = 0
    this.sizes.forEach(size => {
      this.colors.forEach(color => {
        const variant = this.variants.find(v => v.size === size.size && v.color.name === color.name)
        if (variant) {
          totalStock += variant.stock
        }
      })
    })
    return totalStock
  }

  // Default to inStock value
  return this.inStock
}

// Update the normalizeVariants method
productSchema.methods.normalizeVariants = function () {
  if (this.optionsType === 'both') {
    const existingVariants = new Map(this.variants.map(v => [`${v.size}-${v.color.name}`, v]))

    const newVariants = []
    this.sizes.forEach(size => {
      this.colors.forEach(color => {
        const key = `${size.size}-${color.name}`
        const existing = existingVariants.get(key)

        if (existing) {
          // Keep existing variant with its stock
          newVariants.push(existing)
        } else {
          // Create new variant with default stock
          newVariants.push({
            id: `${size.id}-${color.id}`,
            size: size.size,
            color: {
              id: color.id,
              name: color.name,
              hashCode: color.hashCode,
            },
            stock: 0,
            price: this.price,
            images: color.images || [],
          })
        }
      })
    })

    this.variants = newVariants
  }
}

// Add pre-save middleware to handle variants
productSchema.pre('save', function (next) {
  if (this.optionsType === 'both') {
    this.normalizeVariants()
  }
  next()
})

// Add any pre-save hooks or methods here
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 7)
  }
  next()
})

// Add method to update sales
productSchema.methods.updateSales = async function (quantity, price) {
  this.sold += quantity
  this.totalRevenue += quantity * price
  await this.save()

  // Update brand stats if product has a brand
  if (this.brand) {
    await Brand.findByIdAndUpdate(this.brand, {
      $inc: {
        totalSales: quantity,
        revenue: quantity * price,
      },
    })
  }
}

export default mongoose.models.product || mongoose.model('product', productSchema)
