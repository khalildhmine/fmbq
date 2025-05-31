import joi from 'joi'
import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Category } from '@/models'

// GET handler for categories
export async function GET(req) {
  try {
    console.log('Category API: Starting request processing')
    const url = new URL(req.url)
    const level = url.searchParams.get('level')
    const parent = url.searchParams.get('parent')
    const featured = url.searchParams.get('featured')
    const limit = url.searchParams.get('limit')
    const includeInactive = url.searchParams.get('includeInactive') === 'true'

    console.log('Query params:', { level, parent, featured, limit, includeInactive })

    // Connect to database
    await connect()
    console.log('Category API: Connected to database')

    // Build query object based on parameters
    const query = {
      // By default, only return active categories unless explicitly requested
      active: includeInactive ? { $in: [true, false] } : true,
    }
    if (level !== null) query.level = parseInt(level)
    if (parent !== null) query.parent = parent
    if (featured !== null) query.featured = featured === 'true'

    console.log('Query object:', query)

    // Get categories based on query
    const categories = await Category.find(query).limit(limit ? parseInt(limit) : undefined)
    console.log(`Category API: Found ${categories.length} categories matching query`)

    // Get all categories for building hierarchies if needed
    const allCategories = await Category.find({ active: true })
    const allCategoriesObj = allCategories.map(cat => cat.toObject())

    // Function to find children for a category
    function buildCategoryTree(categoryId) {
      const children = allCategoriesObj.filter(
        c => c.parent && c.parent.toString() === categoryId.toString()
      )
      return children.map(child => ({
        ...child,
        children: buildCategoryTree(child._id),
      }))
    }

    // Build category tree if no specific query
    let categoryTree = []
    if (Object.keys(query).length === 1 && query.active === true) {
      // Only has the default active filter
      // Get root categories
      const rootCategories = allCategoriesObj.filter(c => !c.parent)
      categoryTree = rootCategories.map(root => ({
        ...root,
        children: buildCategoryTree(root._id),
      }))
    }

    // Return appropriate response based on query
    if (Object.keys(query).length > 1 || query.active !== true) {
      return NextResponse.json(
        {
          success: true,
          data: categories.map(cat => cat.toObject()),
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: true,
          data: {
            categories: allCategoriesObj,
            categoryTree,
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get categories',
      },
      { status: 500 }
    )
  }
}

// POST handler for creating a category
export async function POST(req) {
  try {
    console.log('Category API: Starting category creation')

    // Get request body
    const body = await req.json()

    // Validate request body
    const schema = joi.object({
      name: joi.string().required(),
      slug: joi.string().required(),
      image: joi.string().required(),
      colors: joi.object().required(),
      level: joi.number().required(),
      parent: joi.string().allow(null, ''),
      featured: joi.boolean(),
      active: joi.boolean(),
    })

    const { error } = schema.validate(body)
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.details[0].message,
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connect()

    // Check if category with same name and level already exists
    const existingCategory = await Category.findOne({
      name: body.name,
      level: body.level,
    })

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'A category with this name already exists at this level',
        },
        { status: 400 }
      )
    }

    // Create category
    const category = new Category({
      ...body,
      parent: body.parent || null,
    })
    await category.save()

    console.log('Category API: Category created successfully', category)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category,
    })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create category',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
