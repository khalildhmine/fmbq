import { Review, Product } from '@/models'
import { connect } from '@/helpers/db' // Standardize import path

const getAll = async ({ page, page_size }, filter) => {
  await connect()
  const reviews = await Review.find(filter)
    .populate('product', 'images')
    .populate('user', 'name')
    .skip((page - 1) * page_size)
    .limit(page_size)
    .sort({
      createdAt: 'desc',
    })
  const reviewsLength = await Review.countDocuments(filter)
  return {
    reviews,
    reviewsLength,
    pagination: {
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: page_size * page < reviewsLength,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(reviewsLength / page_size),
    },
  }
}

const getById = async id => {
  await connect()
  const result = await Review.findById(id).populate('product', 'images').populate('user', 'name')
  if (!result) throw '数据不存在'
  return result
}

const create = async params => {
  await connect()
  const review = new Review(params)
  await review.save()

  // Update product rating
  await updateProductRating(params.product)

  return review
}

const _delete = async id => {
  await connect()
  const review = await Review.findById(id)
  if (!review) throw 'Review not found'
  const productId = review.product
  await Review.findByIdAndDelete(id)

  // Update product rating
  await updateProductRating(productId)
}

const update = async (id, params) => {
  await connect()
  const review = await Review.findById(id)
  if (!review) throw 'Review not found'
  Object.assign(review, params)
  await review.save()

  // Update product rating
  await updateProductRating(review.product)

  return review
}

const updateProductRating = async productId => {
  await connect() // Connect needed here too
  const reviews = await Review.find({ product: productId })
  const numReviews = reviews.length
  if (numReviews > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const avgRating = totalRating / numReviews
    const product = await Product.findById(productId)
    product.rating = avgRating
    await product.save()
  }
}

export const reviewRepo = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
}
