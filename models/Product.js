import mongoose from 'mongoose'

const sizeSchema = new mongoose.Schema({
  id: String,
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE SIZE', null],
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
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
    sizes: [sizeSchema],
    colors: [
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
      enum: ['size', 'color', 'both', 'none'],
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
  },
  {
    timestamps: true,
  }
)

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

export default mongoose.models.product || mongoose.model('product', productSchema)
