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

    const product = await Product.findById(id)
      .populate('brand', 'name logo description slug')
      .populate('categoryHierarchy.mainCategory')
      .populate('categoryHierarchy.subCategory')
      .populate('categoryHierarchy.leafCategory')
      .populate('variants') // Populate variants
      // Important: Explicitly include sizes and colors in the selection
      .select('+sizes +colors +specification +features +description +variants') // Ensure variants are explicitly selected
      .lean()

    if (!product) {
      console.error(`Product with ID ${id} not found`)
      return { notFound: true, error: 'Product not found' }
    }

    // --- Conditional population of sizes and colors based on optionsType and variants ---
    const finalSizes = []
    const finalColors = []

    console.log('PRODUCT OPTIONS TYPE:', product.optionsType)
    console.log('VARIANTS FETCHED:', product.variants?.length, 'items')
    product.variants?.forEach((v, index) => {
      console.log(
        `- Variant ${index + 1}: Size=${v.size}, Color=${v.color?.name}, Stock=${v.stock}, SKU=${v.SKU}`
      )
    })

    if (product.optionsType === 'both' || product.optionsType === 'size') {
      if (product.variants && product.variants.length > 0) {
        // Derive sizes from variants
        const uniqueSizesMap = new Map()
        product.variants.forEach(variant => {
          if (variant.size) {
            const currentStock = uniqueSizesMap.get(variant.size)?.stock || 0
            uniqueSizesMap.set(variant.size, {
              size: variant.size,
              stock: currentStock + variant.stock,
            })
          }
        })
        uniqueSizesMap.forEach(sizeObj => finalSizes.push(sizeObj))
      } else if (product.sizes) {
        // Fallback to top-level sizes if no variants but optionsType is size
        product.sizes.forEach(size => {
          finalSizes.push({
            id: size._id || size.id,
            size: size.size,
            stock: size.stock || 0,
          })
        })
      }
    }

    if (product.optionsType === 'both' || product.optionsType === 'color') {
      if (product.variants && product.variants.length > 0) {
        // Derive colors from variants (deduplicate by hashCode)
        const uniqueColorsMap = new Map()
        product.variants.forEach(variant => {
          if (variant.color?.hashCode) {
            const colorHashCode = variant.color.hashCode
            const currentColor = uniqueColorsMap.get(colorHashCode) || {
              ...variant.color,
              _id: variant.color.id || variant.color._id || colorHashCode, // Ensure _id is set for consistency
              stock: 0,
            }
            currentColor.stock += variant.stock
            uniqueColorsMap.set(colorHashCode, currentColor)
          }
        })
        uniqueColorsMap.forEach(colorObj => finalColors.push(colorObj))
      } else if (product.colors) {
        // Fallback to top-level colors if no variants but optionsType is color
        product.colors.forEach(color => {
          finalColors.push({
            id: color._id || color.id,
            name: color.name,
            hashCode: color.hashCode || color.code,
            stock: color.stock || 0,
          })
        })
      }
    }

    // Ensure variants have _id field for frontend compatibility
    if (product.variants && product.variants.length > 0) {
      product.variants = product.variants.map(variant => {
        if (!variant._id) {
          variant._id = `${variant.size}-${variant.color?.id || variant.color?.name || 'default'}`
        }
        return variant
      })
    }

    // Assign the derived sizes and colors back to the product object
    product.sizes = finalSizes.sort((a, b) => String(a.size).localeCompare(String(b.size)))
    product.colors = finalColors.sort((a, b) => a.name.localeCompare(b.name))

    // Remove redundant `.select(...)` for these fields, as they are now conditionally populated
    delete product.specification // Ensure these are not returned if not needed or derived differently
    delete product.features
    delete product.description

    // Debug log for final sizes and colors
    console.log('\n🎨 Final Product Options:')
    console.log('Sizes:', product.sizes.length, 'items')
    product.sizes.forEach(s => console.log(`- ${s.size}: Stock=${s.stock}`))
    console.log('Colors:', product.colors.length, 'items')
    product.colors.forEach(c => console.log(`- ${c.name}: Hash=${c.hashCode}, Stock=${c.stock}`))
    console.log('----------------------------------------')

    // Detailed logging of all product attributes
    console.log('🔍 PRODUCT DETAILS LOG:')
    console.log('----------------------------------------')
    console.log('📌 Basic Information:')
    console.log(`ID: ${product._id}`)
    console.log(`Title: ${product.title}`)
    console.log(`Price: ${product.price}`)
    console.log(`Discount: ${product.discount}%`)
    console.log(`In Stock: ${product.inStock}`)
    console.log(`Description: ${product.description?.substring(0, 50)}...`)

    console.log('\n📌 Brand Information:')
    console.log(`Brand ID: ${product.brand?._id}`)
    console.log(`Brand Name: ${product.brand?.name}`)
    console.log(`Brand Logo: ${product.brand?.logo}`)

    console.log('\n📌 Images:')
    console.log(`Total Images: ${product.images?.length || 0}`)
    product.images?.forEach((img, index) => {
      console.log(`Image ${index + 1}: ${img.url}`)
    })

    console.log('\n📌 Sizes:')
    console.log(`Total Sizes: ${product.sizes?.length || 0}`)
    product.sizes?.forEach(size => {
      console.log(`- Size: ${size.size}, ID: ${size.id}, Stock: ${size.stock}`)
    })

    console.log('\n📌 Colors:')
    console.log(`Total Colors: ${product.colors?.length || 0}`)
    product.colors?.forEach(color => {
      console.log(
        `- Color: ${color.name}, ID: ${color.id}, Hash: ${color.hashCode}, Stock: ${color.stock}`
      )
    })

    console.log('\n📌 Variants:') // New logging for variants
    console.log(`Total Variants: ${product.variants?.length || 0}`)
    product.variants?.forEach(variant => {
      console.log(
        `- Variant ID: ${variant._id}, Size: ${variant.size}, Color: ${variant.color?.name} (${variant.color?.hashCode}), Stock: ${variant.stock}, SKU: ${variant.SKU}`
      )
    })

    console.log('\n📌 Category Information:')
    console.log('Main Category:', product.categoryHierarchy?.mainCategory?._id)
    console.log('Sub Category:', product.categoryHierarchy?.subCategory?._id)
    console.log('Leaf Category:', product.categoryHierarchy?.leafCategory?._id)

    console.log('\n📌 Additional Information:')
    console.log(`Gender: ${product.gender}`)
    console.log(`Options Type: ${product.optionsType}`)
    console.log(`Slug: ${product.slug}`)
    console.log(`Free Shipping: ${product.freeShipping}`)
    console.log(`Return Policy: ${product.returnPolicy}`)

    console.log('\n📌 Specifications:')
    console.log(`Total Specs: ${product.specification?.length || 0}`)
    product.specification?.forEach(spec => {
      console.log(`- ${spec.title}: ${spec.value}`)
    })

    console.log('\n📌 Features:')
    console.log(`Total Features: ${product.features?.length || 0}`)
    product.features?.forEach(feature => {
      console.log(`- ${feature}`)
    })

    console.log('----------------------------------------')

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
          .select('title price images discount brand inStock sizes colors')
          .limit(11)
          .lean()

        // Log similar products
        console.log('\n📌 Similar Products:')
        console.log(`Total Similar Products: ${smilarProducts.length}`)
        smilarProducts.forEach((prod, index) => {
          console.log(`\nSimilar Product ${index + 1}:`)
          console.log(`- ID: ${prod._id}`)
          console.log(`- Title: ${prod.title}`)
          console.log(`- Price: ${prod.price}`)
          console.log(`- Sizes: ${prod.sizes?.length || 0}`)
          console.log(`- Colors: ${prod.colors?.length || 0}`)
        })
      } catch (similarProductsError) {
        console.error('Error fetching similar products:', similarProductsError)
        // Continue with empty similar products array
      }
    }

    return {
      product,
      smilarProducts: {
        title: 'Similar Products',
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
