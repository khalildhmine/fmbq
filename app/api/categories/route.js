import connectToDB from '@/database'
import Category from '@/models/Category'
import joi from 'joi'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    console.log('Category API: Starting request processing')

    // Connect to database
    await connectToDB()
    console.log('Category API: Connected to database')

    // Get all categories
    const categories = await Category.find({ active: true }) // Only get active categories by default
    console.log(`Category API: Found ${categories.length} active categories`)

    // Build category hierarchy
    const allCategories = categories.map(cat => cat.toObject())

    function findChildren(category) {
      const children = allCategories.filter(
        c => c.parent && c.parent.toString() === category._id.toString() && c.active !== false // Only include active children
      )
      if (children.length > 0) {
        category.children = children.map(child => {
          return findChildren({ ...child })
        })
      }
      return category
    }

    // Get root categories (those without a parent)
    const rootCategories = allCategories.filter(c => !c.parent && c.active !== false)
    console.log(`Category API: Found ${rootCategories.length} active root categories`)

    // Build the category tree
    const categoriesWithChildren = rootCategories.map(category => {
      return findChildren({ ...category })
    })

    // Return the response
    return NextResponse.json(
      {
        data: {
          categories: allCategories,
          categoriesList: categoriesWithChildren[0] || null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get categories',
      },
      { status: 500 }
    )
  }
}

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
      colors: joi.object().optional(),
      level: joi.number().required(),
      parent: joi.string().allow(null), // Allow null for parent
    })

    const { error } = schema.validate(body)
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.details[0].message,
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDB()

    // Create category
    const category = new Category(body)
    await category.save()

    console.log('Category API: Category created successfully')

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: '创建分类成功',
    })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to create category',
      },
      { status: 500 }
    )
  }
}
