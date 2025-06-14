import joi from 'joi'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/mongoose'
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

export async function GET(req) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)

    // Build query object
    const query = {
      inStock: { $gt: 0 }, // Only show products with stock by default
    }

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    // Search
    const search = searchParams.get('search')
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // Category and brand filters
    const category = searchParams.get('category')
    if (category) query.category = category

    const brand = searchParams.get('brand')
    if (brand) query.brand = brand

    // Price range
    const price_min = searchParams.get('price_min')
    const price_max = searchParams.get('price_max')
    if (price_min || price_max) {
      query.price = {}
      if (price_min) query.price.$gte = parseFloat(price_min)
      if (price_max) query.price.$lte = parseFloat(price_max)
    }

    // Colors and sizes
    const colors = searchParams.get('colors')
    if (colors) {
      query.colors = { $in: colors.split(',') }
    }

    const sizes = searchParams.get('sizes')
    if (sizes) {
      query.sizes = { $in: sizes.split(',') }
    }

    // Boolean filters
    const inStock = searchParams.get('inStock')
    if (inStock === 'false') {
      delete query.inStock // Remove the default inStock filter
    }

    const discount = searchParams.get('discount')
    if (discount === 'true') {
      query.discount = { $gt: 0 }
    }

    // Sorting
    let sort = {}
    const sortField = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    sort[sortField] = order === 'desc' ? -1 : 1

    console.log('Query:', JSON.stringify(query, null, 2))
    console.log('Sort:', sort)

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('brand', 'name logo')
        .populate('category', 'name')
        .lean(),
      Product.countDocuments(query),
    ])

    console.log(`Found ${products.length} products out of ${total} total`)

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    })
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error.message,
      },
      { status: 500 }
    )
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
