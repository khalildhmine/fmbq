import { db } from '../db'

const detailsRepo = {
  async getById(id) {
    const details = await db.collection('details').findOne({ _id: id })
    return details
  },

  async getByCategoryId(categoryId) {
    const details = await db.collection('details').findOne({ category_id: categoryId })
    return details
  },

  async create(details) {
    const result = await db.collection('details').insertOne(details)
    return result.insertedId
  },

  async update(id, update) {
    const result = await db.collection('details').updateOne({ _id: id }, { $set: update })
    return result.modifiedCount > 0
  },

  async delete(id) {
    const result = await db.collection('details').deleteOne({ _id: id })
    return result.deletedCount > 0
  },
}

export default detailsRepo
