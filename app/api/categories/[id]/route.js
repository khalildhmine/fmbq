import { connectToDatabase } from '@/helpers/db'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// Timeout for MongoDB operations
const OPERATION_TIMEOUT_MS = 5000

/**
 * GET /api/categories/[id]
 * Get a single category by ID, optionally with its children
 * Query params:
 *   - children (optional, boolean) - include child categories
 *   - levels (optional, number) - number of child levels to include
 */
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

    // Extract query parameters
    const url = new URL(req.url)
    const includeChildren = url.searchParams.get('children') === 'true'
    const childLevels = url.searchParams.get('levels')
      ? parseInt(url.searchParams.get('levels'), 10)
      : 1

    console.log(
      `[Categories API] Fetching category ID: ${id}, includeChildren: ${includeChildren}, childLevels: ${childLevels}`
    )

    // Get direct MongoDB connection
    const { db } = await connectToDatabase()

    // Convert ID to ObjectId
    let objectId
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid category ID',
        },
        { status: 400 }
      )
    }

    // Fetch the category
    const category = await db
      .collection('categories')
      .findOne({ _id: objectId }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    // Convert ObjectIds to strings
    const formattedCategory = {
      ...category,
      _id: category._id.toString(),
      parent: category.parent
        ? typeof category.parent === 'object'
          ? category.parent.toString()
          : category.parent
        : null,
    }

    // If children not requested, return just the category
    if (!includeChildren) {
      return NextResponse.json({
        success: true,
        data: formattedCategory,
      })
    }

    // Otherwise, find and include child categories
    async function getChildCategories(parentId, currentLevel = 0, maxLevel) {
      if (currentLevel >= maxLevel) return []

      const children = await db
        .collection('categories')
        .find({ parent: parentId instanceof ObjectId ? parentId : new ObjectId(parentId) })
        .sort({ displayOrder: 1, name: 1 })
        .maxTimeMS(OPERATION_TIMEOUT_MS)
        .toArray()

      const formattedChildren = await Promise.all(
        children.map(async child => {
          const childWithStringIds = {
            ...child,
            _id: child._id.toString(),
            parent: child.parent
              ? typeof child.parent === 'object'
                ? child.parent.toString()
                : child.parent
              : null,
          }

          // Only get nested children if we haven't reached the max level
          if (currentLevel < maxLevel - 1) {
            childWithStringIds.children = await getChildCategories(
              child._id,
              currentLevel + 1,
              maxLevel
            )
          }

          return childWithStringIds
        })
      )

      return formattedChildren
    }

    // Fetch children for the category
    formattedCategory.children = await getChildCategories(objectId, 0, childLevels)

    return NextResponse.json({
      success: true,
      data: formattedCategory,
    })
  } catch (error) {
    console.error('[Categories API] Error fetching category:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch category',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id]
 * Update a specific category
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params
    const data = await req.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category ID is required',
        },
        { status: 400 }
      )
    }

    console.log(`[Categories API] Updating category ${id}:`, data)

    // Get direct MongoDB connection
    const { db } = await connectToDatabase()

    // Update timestamp
    data.updatedAt = new Date()

    // Ensure level is a number if provided
    if (data.level !== undefined) {
      data.level = parseInt(data.level, 10)
    }

    // Convert parent to ObjectId if provided
    if (data.parent) {
      try {
        data.parent = new ObjectId(data.parent)
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid parent ID',
          },
          { status: 400 }
        )
      }
    }

    // Convert ID to ObjectId
    let objectId
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid category ID',
        },
        { status: 400 }
      )
    }

    // If slug is being updated, check it's unique
    if (data.slug) {
      const existingCategory = await db.collection('categories').findOne(
        {
          slug: data.slug,
          _id: { $ne: objectId },
        },
        { maxTimeMS: OPERATION_TIMEOUT_MS }
      )

      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            message: 'A category with this slug already exists',
          },
          { status: 400 }
        )
      }
    }

    // Update the category
    const result = await db.collection('categories').findOneAndUpdate(
      { _id: objectId },
      { $set: data },
      {
        returnDocument: 'after',
        maxTimeMS: OPERATION_TIMEOUT_MS,
      }
    )

    if (!result.value) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    // Convert ObjectId to string in the response
    const updatedCategory = { ...result.value }
    updatedCategory._id = updatedCategory._id.toString()

    if (updatedCategory.parent && typeof updatedCategory.parent === 'object') {
      updatedCategory.parent = updatedCategory.parent.toString()
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    })
  } catch (error) {
    console.error('[Categories API] Error updating category:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update category',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a specific category
 */
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

    console.log(`[Categories API] Deleting category: ${id}`)

    // Get direct MongoDB connection
    const { db } = await connectToDatabase()

    // Convert ID to ObjectId
    let objectId
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid category ID',
        },
        { status: 400 }
      )
    }

    // Check if category has children
    const childrenCount = await db.collection('categories').countDocuments(
      {
        parent: objectId,
      },
      { maxTimeMS: OPERATION_TIMEOUT_MS }
    )

    if (childrenCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete category with children. Delete children first or reassign them.',
        },
        { status: 400 }
      )
    }

    // Check if category is used in products
    const productsCount = await db.collection('products').countDocuments(
      {
        category: objectId,
      },
      { maxTimeMS: OPERATION_TIMEOUT_MS }
    )

    if (productsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete category used by products. Remove or reassign products first.',
        },
        { status: 400 }
      )
    }

    const result = await db
      .collection('categories')
      .findOneAndDelete({ _id: objectId }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (!result.value) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      )
    }

    // Convert ObjectId to string in the response
    const deletedCategory = { ...result.value }
    deletedCategory._id = deletedCategory._id.toString()

    if (deletedCategory.parent && typeof deletedCategory.parent === 'object') {
      deletedCategory.parent = deletedCategory.parent.toString()
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory,
    })
  } catch (error) {
    console.error('[Categories API] Error deleting category:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete category',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
