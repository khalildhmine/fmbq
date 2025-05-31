import { Product } from '@/models'
import { connect } from '@/helpers/db'
import Category from '@/models/Category'

const getAll = async ({ page, page_size }, filter = {}, sort = {}) => {
  await connect()
  const products = await Product.find(filter)
    .select(
      '-description -info -specification -category -category_levels -sizes  -reviews -numReviews'
    )
    .skip((page - 1) * page_size)
    .limit(page_size)
    .sort(sort)
  const productsLength = await Product.countDocuments(filter)

  const mainMaxPrice = Math.max(
    ...(await Product.find({
      ...filter.categoryFilter,
      inStock: { $gte: 1 },
    }).distinct('price'))
  )
  const mainMinPrice = Math.min(
    ...(await Product.find({
      ...filter.categoryFilter,
      inStock: { $gte: 1 },
    }).distinct('price'))
  )

  return {
    mainMaxPrice,
    mainMinPrice,
    products,
    productsLength,
    pagination: {
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: page_size * page < productsLength,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(productsLength / page_size),
    },
  }
}

const getById = async id => {
  await connect()
  const result = await Product.findById(id)
  if (!result) throw '产品不存在'
  return result
}

const create = async params => {
  await connect()

  // Ensure we have valid data for required ObjectId fields
  if (params.brand && typeof params.brand === 'string' && params.brand.length < 24) {
    console.log('Invalid brand ID detected, setting to null')
    params.brand = null
  }

  // Ensure valid categoryHierarchy
  if (params.categoryHierarchy) {
    if (
      params.categoryHierarchy.mainCategory &&
      typeof params.categoryHierarchy.mainCategory === 'string' &&
      params.categoryHierarchy.mainCategory.length < 24
    ) {
      console.log('Invalid mainCategory ID detected, setting to null')
      params.categoryHierarchy.mainCategory = null
    }

    if (
      params.categoryHierarchy.subCategory &&
      typeof params.categoryHierarchy.subCategory === 'string' &&
      params.categoryHierarchy.subCategory.length < 24
    ) {
      params.categoryHierarchy.subCategory = null
    }

    if (
      params.categoryHierarchy.leafCategory &&
      typeof params.categoryHierarchy.leafCategory === 'string' &&
      params.categoryHierarchy.leafCategory.length < 24
    ) {
      params.categoryHierarchy.leafCategory = null
    }
  }

  const newProduct = new Product(params)
  const mainCategory = await Category.findOne({
    parent: undefined,
  })

  if (mainCategory) newProduct.category.unshift(mainCategory?._id)
  await newProduct.save()
  return newProduct // Return the created product
}

const _delete = async id => {
  await connect()
  const product = await Product.findById(id)
  if (!product) throw '产品不存在'
  await Product.findByIdAndDelete(id)
}

const update = async (id, params) => {
  await connect()
  const product = await Product.findById(id)
  if (!product) throw '产品不存在'
  Object.assign(product, params)
  await product.save()
}

const getItemDetail = async id => {
  try {
    await connect()

    if (!id) {
      console.error('Invalid product ID provided to getItemDetail:', id)
      return { notFound: true, error: 'Invalid product ID' }
    }

    let product

    try {
      // First attempt - with full population
      product = await Product.findById({ _id: id })
        .populate('categoryHierarchy.mainCategory')
        .populate('categoryHierarchy.subCategory')
        .populate('categoryHierarchy.leafCategory')
        .populate({
          path: 'brand',
          select: 'name logo description slug', // Select the fields we want from brand
        })
        .lean()
    } catch (populateError) {
      console.error('Population failed, trying without brand population:', populateError)

      // Second attempt - without brand population
      product = await Product.findById({ _id: id })
        .populate('categoryHierarchy.mainCategory')
        .populate('categoryHierarchy.subCategory')
        .populate('categoryHierarchy.leafCategory')
        .lean()
    }

    if (!product) {
      console.error(`Product with ID ${id} not found`)
      return { notFound: true, error: 'Product not found' }
    }

    // Safe handling if category is empty or undefined
    let productCategoryID = null

    // Try to get a valid category ID from the hierarchical structure
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
      try {
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
      } catch (similarProductsError) {
        console.error('Error fetching similar products:', similarProductsError)
        // Continue with empty similar products array
      }
    }

    return {
      product,
      smilarProducts: {
        title: '类似商品',
        products: smilarProducts,
      },
    }
  } catch (error) {
    console.error('Error in getItemDetail:', error)
    // Return a structured error that the API can handle
    return {
      notFound: true,
      error: error.message || 'Error fetching product details',
      errorObject: error,
    }
  }
}

const getProductsByCategories = async (filter = {}) => {
  await connect()
  const products = await Product.find(filter).lean().exec()
  const categories = await Category.find().lean().exec()

  const categoryMap = categories.reduce((acc, category) => {
    acc[category._id] = category
    return acc
  }, {})

  const categorizedProducts = products.reduce((acc, product) => {
    // Get the category ID from the hierarchy (leaf, sub, or main)
    let categoryId = null

    if (product.categoryHierarchy) {
      if (product.categoryHierarchy.leafCategory) {
        categoryId = product.categoryHierarchy.leafCategory
      } else if (product.categoryHierarchy.subCategory) {
        categoryId = product.categoryHierarchy.subCategory
      } else if (product.categoryHierarchy.mainCategory) {
        categoryId = product.categoryHierarchy.mainCategory
      }
    }

    // Fallback to the first category in the legacy array if no hierarchy
    if (!categoryId && product.category && product.category.length > 0) {
      categoryId = product.category[0]
    }

    // Use a default category if none found
    if (!categoryId) {
      categoryId = 'uncategorized'
    }

    // Get the category object from the map or create a default
    const category = categoryMap[categoryId] || {
      _id: 'uncategorized',
      name: 'Uncategorized',
      image: product.images && product.images.length > 0 ? product.images[0].url : '',
    }

    if (!acc[category._id]) {
      acc[category._id] = {
        id: category._id,
        name: category.name,
        image: category.image,
        products: [],
        maxDiscount: 0,
        totalProducts: 0,
      }
    }

    acc[category._id].products.push(product)
    acc[category._id].maxDiscount = Math.max(acc[category._id].maxDiscount, product.discount || 0)
    acc[category._id].totalProducts++

    return acc
  }, {})

  return Object.values(categorizedProducts).sort((a, b) => b.maxDiscount - a.maxDiscount)
}

export const productRepo = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getItemDetail,
  getProductsByCategories,
}
