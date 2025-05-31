import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { Product } from '@/models'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

// GET a single product by ID
export async function GET(req, context) {
  try {
    await connectToDatabase()

    // Get and validate params
    const params = await context.params

    // Ensure we have a valid ID
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      )
    }

    const productId = params.id

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    try {
      const product = await Product.findById(new ObjectId(productId))
        .populate('brand')
        .populate('category')
        .populate('categoryHierarchy.mainCategory')
        .populate('categoryHierarchy.subCategory')
        .populate('categoryHierarchy.leafCategory')
        .lean()

      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
      }

      // Convert _id to string to prevent serialization issues
      const formattedProduct = {
        ...product,
        _id: product._id.toString(),
        // Safely format brand data if it exists
        brand: product.brand
          ? {
              ...product.brand,
              _id: product.brand._id?.toString(),
            }
          : null,
        // Safely format category array if it exists
        category: Array.isArray(product.category)
          ? product.category.map(cat =>
              cat
                ? {
                    ...cat,
                    _id: cat._id?.toString(),
                  }
                : null
            )
          : [],
        // Safely format categoryHierarchy if it exists
        categoryHierarchy: product.categoryHierarchy
          ? {
              mainCategory: product.categoryHierarchy.mainCategory
                ? {
                    ...product.categoryHierarchy.mainCategory,
                    _id: product.categoryHierarchy.mainCategory._id?.toString(),
                  }
                : null,
              subCategory: product.categoryHierarchy.subCategory
                ? {
                    ...product.categoryHierarchy.subCategory,
                    _id: product.categoryHierarchy.subCategory._id?.toString(),
                  }
                : null,
              leafCategory: product.categoryHierarchy.leafCategory
                ? {
                    ...product.categoryHierarchy.leafCategory,
                    _id: product.categoryHierarchy.leafCategory._id?.toString(),
                  }
                : null,
            }
          : null,
      }

      return NextResponse.json({
        success: true,
        data: formattedProduct,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// PUT (update) a product by ID
export async function PUT(request, context) {
  try {
    await connectToDatabase()
    const params = await context.params
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 })
    }

    const body = await request.json()
    console.log('Updating product:', id, body)

    // Format the update data
    const updateData = {
      ...body,
      // Ensure ObjectIds are properly handled
      brand: body.brand?._id || body.brand,
      category: Array.isArray(body.category)
        ? body.category.map(cat => cat?._id || cat)
        : body.category,
      categoryHierarchy: body.categoryHierarchy
        ? {
            mainCategory:
              body.categoryHierarchy.mainCategory?._id || body.categoryHierarchy.mainCategory,
            subCategory:
              body.categoryHierarchy.subCategory?._id || body.categoryHierarchy.subCategory,
            leafCategory:
              body.categoryHierarchy.leafCategory?._id || body.categoryHierarchy.leafCategory,
          }
        : body.categoryHierarchy,
    }

    const result = await Product.findByIdAndUpdate(
      new ObjectId(id),
      { $set: updateData },
      { new: true }
    )
      .populate('brand')
      .populate('category')
      .populate('categoryHierarchy.mainCategory')
      .populate('categoryHierarchy.subCategory')
      .populate('categoryHierarchy.leafCategory')
      .lean()

    if (!result) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Format the response data
    const formattedResult = {
      ...result,
      _id: result._id.toString(),
      brand: result.brand
        ? {
            ...result.brand,
            _id: result.brand._id?.toString(),
          }
        : null,
      category: Array.isArray(result.category)
        ? result.category.map(cat =>
            cat
              ? {
                  ...cat,
                  _id: cat._id?.toString(),
                }
              : null
          )
        : [],
      categoryHierarchy: result.categoryHierarchy
        ? {
            mainCategory: result.categoryHierarchy.mainCategory
              ? {
                  ...result.categoryHierarchy.mainCategory,
                  _id: result.categoryHierarchy.mainCategory._id?.toString(),
                }
              : null,
            subCategory: result.categoryHierarchy.subCategory
              ? {
                  ...result.categoryHierarchy.subCategory,
                  _id: result.categoryHierarchy.subCategory._id?.toString(),
                }
              : null,
            leafCategory: result.categoryHierarchy.leafCategory
              ? {
                  ...result.categoryHierarchy.leafCategory,
                  _id: result.categoryHierarchy.leafCategory._id?.toString(),
                }
              : null,
          }
        : null,
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: formattedResult,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE a product by ID
export async function DELETE(request, context) {
  try {
    await connectToDatabase()
    const params = await context.params
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 })
    }

    const result = await Product.findByIdAndDelete(new ObjectId(id))

    if (!result) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
