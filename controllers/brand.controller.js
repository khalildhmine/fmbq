import Brand from '../models/Brand'
import Product from '../models/Product'
import { catchAsync } from '../utils/catchAsync'

export const getBrands = catchAsync(async (req, res) => {
  const brands = await Brand.find({ active: true })
    .select('name logo slug description featured productCount topDiscount')
    .sort('-productCount')
    .lean()

  // Fetch product counts in parallel
  const brandsWithStats = await Promise.all(
    brands.map(async brand => {
      const products = await Product.find({
        brand: brand._id,
        inStock: { $gt: 0 },
      })
        .select('price discount sold')
        .limit(5)
        .lean()

      return {
        ...brand,
        productCount: products.length,
        topDiscount: Math.max(...products.map(p => p.discount || 0), 0),
        products,
      }
    })
  )

  res.json({
    success: true,
    data: {
      brands: brandsWithStats,
      total: brandsWithStats.length,
    },
  })
})

export const getFeaturedBrands = catchAsync(async (req, res) => {
  const featuredBrands = await Brand.find({
    featured: true,
    active: true,
  })
    .select('name logo slug description productCount topDiscount')
    .sort('-productCount')
    .limit(10)
    .lean()

  res.json({
    success: true,
    data: {
      brands: featuredBrands,
      total: featuredBrands.length,
    },
  })
})

export const getBrandById = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id)
    .select('name logo slug description featured productCount')
    .lean()

  if (!brand) {
    return res.status(404).json({
      success: false,
      message: 'Brand not found',
    })
  }

  const products = await Product.find({
    brand: brand._id,
    inStock: { $gt: 0 },
  })
    .select('name images price discount sold')
    .sort('-sold')
    .limit(20)
    .lean()

  res.json({
    success: true,
    data: {
      ...brand,
      products,
    },
  })
})
