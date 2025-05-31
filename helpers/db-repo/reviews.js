import { db } from '../db'

const reviewRepo = {
  async getById(id) {
    const review = await db.collection('reviews').findOne({ _id: id })
    return review
  },

  async getByProductId(productId, options = {}) {
    const reviews = await db.collection('reviews').find({ productId }, options).toArray()
    return reviews
  },

  async getByUserId(userId, options = {}) {
    const reviews = await db.collection('reviews').find({ userId }, options).toArray()
    return reviews
  },

  async create(review) {
    const result = await db.collection('reviews').insertOne(review)
    return result.insertedId
  },

  async update(id, update) {
    const result = await db.collection('reviews').updateOne({ _id: id }, { $set: update })
    return result.modifiedCount > 0
  },

  async delete(id) {
    const result = await db.collection('reviews').deleteOne({ _id: id })
    return result.deletedCount > 0
  },

  async getAverageRating(productId) {
    const result = await db
      .collection('reviews')
      .aggregate([
        { $match: { productId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .toArray()

    return result[0] || { averageRating: 0, totalReviews: 0 }
  },
}

export default reviewRepo
