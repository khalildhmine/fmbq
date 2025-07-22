import joi from 'joi'
import { ObjectId } from 'mongodb'
import { connectToDatabase, isDbConnected } from '@/lib/mongoose'
import { getQuery } from '@/helpers/api'
import { NextResponse } from 'next/server'
import { Category } from '@/models'
import { productRepo } from '@/helpers/db-repo/product-repo'
import { Product } from '@/models'

// Helper function to create proper Response objects
const setJson = (data, status = 200) => {
  return NextResponse.json(data, { status })
}

const errorHandler = err => {
  console.error('[API Error Handler]:', err)
  return NextResponse.json(
    {
      status: 'error',
      message: err.message || 'Internal server error',
    },
    { status: err.status || 500 }
  )
}

// Define apiHandler wrapper to ensure all handlers return proper Response objects
const apiHandler = (handler, options = {}) => {
  return async req => {
    try {
      // Ensure database connection
      if (!isDbConnected()) {
        await connectToDatabase()
      }
      // Call the handler function
      return await handler(req)
    } catch (error) {
      console.error('[API Error Handler]:', error)
      return errorHandler(error)
    }
  }
}

export const getAllProduct = async req => {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 20
    const sort = searchParams.get('sort') || 'latest'
    const populate = searchParams.get('populate')

    // Build filter object
    const filter = {}

    // Add sorting options
    let sortOption = {}
    if (sort === 'latest') {
      sortOption = { createdAt: -1 }
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 }
    } else if (sort === 'price-asc' || sort === 'price_asc') {
      sortOption = { price: 1 }
    } else if (sort === 'price-desc' || sort === 'price_desc') {
      sortOption = { price: -1 }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)
    const limitNum = Number(limit)

    console.log('⭐ Filter:', filter)
    console.log('⭐ Sort:', sortOption)
    console.log('⭐ Pagination:', { skip, limit: limitNum })

    // Create base query
    let productsQuery = Product.find(filter)

    // Add population if requested
    if (populate === 'brand') {
      productsQuery = productsQuery.populate({
        path: 'brand',
        select: '_id name logo description slug',
      })
    }

    // Add sorting and pagination
    productsQuery = productsQuery.sort(sortOption).skip(skip).limit(limitNum)

    // Execute query
    const products = await productsQuery.lean()

    // Transform brand data to ensure consistent format
    const transformedProducts = products.map(product => {
      if (product.brand) {
        // If brand is populated (object)
        if (typeof product.brand === 'object') {
          return {
            ...product,
            brand: {
              _id: product.brand._id,
              name: product.brand.name || 'Unknown Brand',
              logo: product.brand.logo || null,
              description: product.brand.description || '',
              slug: product.brand.slug || product.brand._id.toString(),
            },
          }
        }
        // If brand is just an ID (string)
        return {
          ...product,
          brand: {
            _id: product.brand,
            name: 'Unknown Brand',
            logo: null,
            description: '',
            slug: product.brand.toString(),
          },
        }
      }
      return product
    })

    console.log(`⭐ Found ${transformedProducts.length} products`)

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    return setJson({
      products: transformedProducts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('⭐ API Error in getAllProduct:', error)
    return errorHandler(error)
  }
}

const createProduct = apiHandler(
  async req => {
    try {
      const body = await req.json()
      console.log('Creating product with body:', JSON.stringify(body, null, 2))

      // Add data validation and fixing
      // Ensure slug exists
      if (!body.slug) {
        body.slug =
          body.title
            ?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') || ''
      }

      // Convert image objects to the correct format if needed
      if (body.images && Array.isArray(body.images)) {
        body.images = body.images.map(img => {
          // If image is already in the correct format
          if (img.url) return img

          // If image is a string URL
          if (typeof img === 'string') {
            return { url: img, alt: '', primary: false }
          }

          return img
        })
      }

      // Ensure categoryHierarchy exists
      if (!body.categoryHierarchy || !body.categoryHierarchy.mainCategory) {
        if (body.category && body.category.length > 0 && body.category[0]) {
          body.categoryHierarchy = {
            mainCategory: body.category[0],
            subCategory: body.category[1] || null,
            leafCategory: body.category[2] || null,
          }
        } else {
          // Default empty categoryHierarchy
          body.categoryHierarchy = {
            mainCategory: null,
            subCategory: null,
            leafCategory: null,
          }
        }
      }

      // Fix colors - ensure they have IDs
      if (body.colors && Array.isArray(body.colors)) {
        body.colors = body.colors.map(color => {
          if (!color) return { id: new ObjectId().toString(), name: 'Default', hashCode: '#000000' }

          if (!color.id) {
            return { ...color, id: new ObjectId().toString() }
          }
          return color
        })
      } else {
        body.colors = []
      }

      // Fix specification - ensure they have titles
      if (body.specification && Array.isArray(body.specification)) {
        body.specification = body.specification.map(spec => {
          if (!spec) return { title: 'Specification', value: '' }

          if (!spec.title) {
            return { ...spec, title: 'Specification' }
          }
          return spec
        })
      } else {
        body.specification = []
      }

      // Fix info array
      if (!body.info || !Array.isArray(body.info)) {
        body.info = []
      }

      // Set default values for other required fields
      if (!body.price) body.price = 0
      if (!body.inStock) body.inStock = 0
      if (!body.gender) body.gender = 'men'
      if (!body.rating) body.rating = 0
      if (!body.numReviews) body.numReviews = 0

      // Use the productRepo instead of direct MongoDB access
      const result = await productRepo.create(body)

      return setJson({
        success: true,
        message: 'Product added successfully',
        id: result?._id?.toString() || 'unknown',
      })
    } catch (error) {
      console.error('Product creation error:', error)

      // Create a simpler error message for client
      let errorMessage = 'Failed to create product'
      if (error.errors) {
        errorMessage = Object.keys(error.errors)
          .map(key => `${key}: ${error.errors[key].message}`)
          .join('; ')
      } else if (error.message) {
        errorMessage = error.message
      }

      return setJson(
        {
          success: false,
          status: 'error',
          message: errorMessage,
        },
        500
      )
    }
  },
  {
    isJwt: true,
    identity: 'admin',
    schema: joi.object({
      title: joi.string().required(),
      price: joi.number(),
      category: joi.array(),
      images: joi.array(),
      info: joi.array(),
      specification: joi.array(),
      inStock: joi.number(),
      description: joi.string().allow(''),
      discount: joi.number(),
      sizes: joi.array(),
      colors: joi.array(),
      category_levels: joi.object(),
      gender: joi.string().allow('men', 'women', 'kids', ''),
    }),
  }
)

const getProductsByCategories = apiHandler(async req => {
  try {
    const connection = await connectToDatabase()
    const db = connection.db
    const collection = db.collection('products')

    const filter = {
      discount: { $gte: 1 }, // Only fetch products with discounts
      inStock: { $gte: 1 },
    }

    // Get all categories
    const categories = await db.collection('categories').find({}).toArray()

    // Initialize result object
    const categorizedProducts = {}

    // For each category, fetch products
    for (const category of categories) {
      const products = await collection
        .find({
          ...filter,
          category: category._id.toString(),
        })
        .limit(8)
        .toArray()

      if (products.length > 0) {
        categorizedProducts[category.name] = products
      }
    }

    return setJson({
      categorizedProducts,
    })
  } catch (error) {
    console.error('Products by categories error:', error)
    return setJson(
      {
        status: 'error',
        message: error.message || 'Failed to get products by categories',
      },
      500
    )
  }
})

export async function GET(request) {
  try {
    // Ensure database connection is established
    if (!isDbConnected()) {
      console.log('Establishing database connection...')
      await connectToDatabase()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const sort = searchParams.get('sort') || 'latest'

    // Convert searchParams to plain object
    const queryParams = Object.fromEntries(searchParams.entries())

    // Build filter
    const filter = buildProductFilter(queryParams)

    // Build sort options
    const sortOptions = {}
    switch (sort) {
      case 'price_asc':
        sortOptions.price = 1
        break
      case 'price_desc':
        sortOptions.price = -1
        break
      case 'popular':
        sortOptions.sold = -1
        break
      case 'latest':
      default:
        sortOptions.createdAt = -1
    }

    const skip = (page - 1) * limit

    console.log('Executing product query with:', {
      filter,
      sortOptions,
      skip,
      limit,
    })

    // Get products with filters
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('brand')
      .lean()

    // Get total count
    const total = await Product.countDocuments(filter)

    // Get facets
    const facets = await getFacets(filter)

    return NextResponse.json({
      success: true,
      data: {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        facets,
      },
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to search products',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

function buildProductFilter(query) {
  const filter = {}

  // Handle inStock
  if (query.inStock === 'true') {
    filter.inStock = { $gt: 0 }
  }

  // Handle category
  const categoryId = query.category || query.categories
  if (categoryId && categoryId !== 'null' && categoryId !== 'undefined') {
    filter.$or = [
      { category: categoryId },
      { 'categoryHierarchy.mainCategory': categoryId },
      { 'categoryHierarchy.subCategory': categoryId },
      { 'categoryHierarchy.leafCategory': categoryId },
    ]
  }

  // Handle brand - check both brand and brands parameters
  const brandParam = query.brand || query.brands
  if (brandParam && brandParam !== 'null' && brandParam !== 'undefined') {
    const brandIds = brandParam.split(',').filter(id => id && id !== 'null' && id !== 'undefined')
    if (brandIds.length > 0) {
      // Convert string IDs to ObjectId if needed
      const brandObjectIds = brandIds.map(id => {
        try {
          return new ObjectId(id)
        } catch (e) {
          return id
        }
      })
      filter.brand = { $in: brandObjectIds }
    }
  }

  // Handle colors
  if (query.colors) {
    const colorNames = query.colors.split(',').filter(Boolean)
    if (colorNames.length > 0) {
      filter['colors.name'] = { $in: colorNames }
    }
  }

  // Handle sizes
  if (query.sizes) {
    const sizeValues = query.sizes.split(',').filter(Boolean)
    if (sizeValues.length > 0) {
      filter['sizes.size'] = { $in: sizeValues }
    }
  }

  // Handle price range
  if (query.price_min || query.price_max) {
    filter.price = {}
    if (query.price_min && !isNaN(query.price_min)) {
      filter.price.$gte = Number(query.price_min)
    }
    if (query.price_max && !isNaN(query.price_max)) {
      filter.price.$lte = Number(query.price_max)
    }
  }

  // Handle discount
  if (query.discount === 'true') {
    filter.discount = { $gt: 0 }
  }

  console.log('🔍 Query params:', query)
  console.log('🔍 Built filter:', JSON.stringify(filter, null, 2))
  return filter
}

async function getFacets(baseFilter) {
  const [colorFacets, sizeFacets, categoryFacets, brandFacets, priceRange] = await Promise.all([
    // Get color facets
    Product.aggregate([
      { $match: baseFilter },
      { $unwind: '$colors' },
      {
        $group: {
          _id: { name: '$colors.name', hashCode: '$colors.hashCode' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          hashCode: '$_id.hashCode',
          count: 1,
        },
      },
    ]),

    // Get size facets
    Product.aggregate([
      { $match: baseFilter },
      { $unwind: '$sizes' },
      {
        $group: {
          _id: '$sizes.size',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          size: '$_id',
          count: 1,
        },
      },
    ]),

    // Get category facets
    Product.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]),

    // Get brand facets
    Product.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
        },
      },
    ]),

    // Get price range
    Product.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
        },
      },
    ]),
  ])

  return {
    colors: colorFacets,
    sizes: sizeFacets,
    categories: categoryFacets,
    brands: brandFacets,
    priceRange: priceRange[0] || { min: 0, max: 0 },
  }
}

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.price) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title and price are required',
        },
        { status: 400 }
      )
    }

    // Format sizes data if present
    if (body.sizes) {
      body.sizes = body.sizes.map(size => ({
        ...size,
        size: size.size || 'ONE SIZE', // Provide default size
        stock: Number(size.stock || 0),
      }))
    }

    // Create product instance
    const product = new Product(body)

    // Save to database
    await product.save()

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    })
  } catch (error) {
    console.error('Product creation error:', error)

    // Determine if it's a validation error
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message),
        },
        { status: 400 }
      )
    }

    // General error
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create product',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

// When parsing the categories filter from the query params, make sure you convert all category IDs to strings before building the MongoDB query.
// This ensures that both string and ObjectId values in your product documents will match correctly.

const parseCategoryIds = ids =>
  Array.isArray(ids)
    ? ids.map(id => (id && typeof id === 'string' ? id : String(id))).filter(Boolean)
    : typeof ids === 'string'
      ? ids
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : []
