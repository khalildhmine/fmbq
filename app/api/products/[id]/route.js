import { NextResponse } from 'next/server'
import { productRepo } from '@/helpers/db-repo/product-repo'
import { connectToDatabase } from '@/helpers/db'

// GET a single product by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    const { id } = params
    console.log('Fetching product details for ID:', id)

    const result = await productRepo.getItemDetail(id)

    if (result.notFound) {
      console.error('Product not found:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Validate sizes and colors data
    const { product } = result
    if (!product.sizes) product.sizes = []
    if (!product.colors) product.colors = []

    console.log('Product options found:', {
      sizes: product.sizes.length,
      colors: product.colors.length,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch product details',
      },
      { status: 500 }
    )
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
