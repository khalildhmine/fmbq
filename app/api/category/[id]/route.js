import joi from 'joi'
import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Category } from '@/models'

// GET a specific category by ID
export async function GET(req, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category ID is required',
        },
        { status: 400 }
      )
    }

    await connect()

    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch category',
      },
      { status: 500 }
    )
  }
}

// Update a category
export async function PUT(req, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category ID is required',
        },
        { status: 400 }
      )
    }

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

    await connect()

    // Check if category exists
    const existingCategory = await Category.findById(id)

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    // Check for duplicate name at same level (excluding self)
    const duplicateCategory = await Category.findOne({
      name: body.name,
      level: body.level,
      _id: { $ne: id },
    })

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'A category with this name already exists at this level',
        },
        { status: 400 }
      )
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...body, parent: body.parent || null },
      { new: true, runValidators: true }
    )

    console.log('Category updated successfully:', updatedCategory)

    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update category',
      },
      { status: 500 }
    )
  }
}

// Delete a category
export async function DELETE(req, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category ID is required',
        },
        { status: 400 }
      )
    }

    await connect()

    // Check if category exists
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    // Check if category has children
    const childCategories = await Category.find({ parent: id })

    if (childCategories.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete category with subcategories. Please delete subcategories first.',
        },
        { status: 400 }
      )
    }

    // Delete category
    await Category.findByIdAndDelete(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete category',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
