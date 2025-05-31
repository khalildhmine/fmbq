import { NextResponse } from 'next/server'
import { getQuery } from '@/helpers'

// Direct import to avoid any module resolution issues
import { productRepo } from '@/helpers/db-repo/index.js'
import { connect } from '@/helpers/db'
import { Product } from '@/models'

// Fallback implementation if the imported productRepo.getItemDetail fails
async function fallbackGetItemDetail(id) {
  console.log('Using fallback getItemDetail implementation')
  try {
    await connect()

    if (!id) {
      return { notFound: true, error: 'Invalid product ID' }
    }

    const product = await Product.findById(id)
      .populate('categoryHierarchy.mainCategory')
      .populate('categoryHierarchy.subCategory')
      .populate('categoryHierarchy.leafCategory')
      .populate({
        path: 'brand',
        select: 'name logo description slug', // Select the fields we want from brand
      })
      .lean()

    if (!product) {
      return { notFound: true, error: 'Product not found' }
    }

    // Try to get a valid category ID from the hierarchical structure
    let productCategoryID = null

    if (product.categoryHierarchy) {
      if (product.categoryHierarchy.leafCategory) {
        productCategoryID = product.categoryHierarchy.leafCategory
      } else if (product.categoryHierarchy.subCategory) {
        productCategoryID = product.categoryHierarchy.subCategory
      } else if (product.categoryHierarchy.mainCategory) {
        productCategoryID = product.categoryHierarchy.mainCategory
      }
    }

    // Fallback to legacy category array if hierarchical structure is empty
    if (!productCategoryID && product.category && product.category.length > 0) {
      productCategoryID = product.category[product.category.length - 1]
    }

    let smilarProducts = []

    // Only fetch similar products if we have a category
    if (productCategoryID) {
      const similarQuery = { inStock: { $gte: 1 }, _id: { $ne: product._id } }

      // Try to match by hierarchical category first
      if (typeof productCategoryID === 'object' && productCategoryID._id) {
        // If we have a populated category object
        similarQuery['$or'] = [
          { 'categoryHierarchy.mainCategory': productCategoryID._id },
          { 'categoryHierarchy.subCategory': productCategoryID._id },
          { 'categoryHierarchy.leafCategory': productCategoryID._id },
        ]
      } else {
        // Otherwise try with both hierarchical and legacy systems
        const categoryId =
          typeof productCategoryID === 'object' ? productCategoryID._id : productCategoryID
        similarQuery['$or'] = [
          { 'categoryHierarchy.mainCategory': categoryId },
          { 'categoryHierarchy.subCategory': categoryId },
          { 'categoryHierarchy.leafCategory': categoryId },
          { category: { $in: [categoryId] } },
        ]
      }

      smilarProducts = await Product.find(similarQuery)
        .select('-description -info -specification -sizes -reviews -numReviews')
        .limit(11)
        .lean()
    }

    return {
      product,
      smilarProducts: {
        title: '类似商品',
        products: smilarProducts || [],
      },
    }
  } catch (error) {
    console.error('Error in fallback getItemDetail:', error)
    return {
      notFound: true,
      error: error.message || 'Error fetching product details',
    }
  }
}

export async function GET(req) {
  try {
    const { id } = getQuery(req)

    if (!id) {
      console.error('Missing product ID in request')
      return NextResponse.json(
        {
          error: 'Product ID is required',
          status: 400,
        },
        { status: 400 }
      )
    }

    console.log('productRepo availability check:', {
      repoExists: !!productRepo,
      methodExists: productRepo && typeof productRepo.getItemDetail === 'function',
    })

    let result

    // Try the normal implementation first
    if (productRepo && typeof productRepo.getItemDetail === 'function') {
      try {
        result = await productRepo.getItemDetail(id)
      } catch (repoError) {
        console.error('Error using productRepo.getItemDetail:', repoError)
        // If main method fails, use fallback
        result = await fallbackGetItemDetail(id)
      }
    } else {
      // Use fallback if productRepo is not available
      console.warn('productRepo or getItemDetail not available, using fallback')
      result = await fallbackGetItemDetail(id)
    }

    if (!result || result.notFound) {
      console.error(`Product with ID ${id} not found or error occurred`, result)
      return NextResponse.json(
        {
          error: result?.error || 'Product not found',
          status: 404,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in product detail handler:', error)
    return NextResponse.json(
      {
        error: error.message || 'An error occurred while fetching product details',
        status: 500,
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
