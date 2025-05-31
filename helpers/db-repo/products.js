import { db } from '../db'

const productRepo = {
  async getById(id) {
    const product = await db.collection('products').findOne({ _id: id })
    return product
  },

  async getAll(query = {}, options = {}) {
    const products = await db.collection('products').find(query, options).toArray()
    return products
  },

  async create(product) {
    const result = await db.collection('products').insertOne(product)
    return result.insertedId
  },

  async update(id, update) {
    const result = await db.collection('products').updateOne({ _id: id }, { $set: update })
    return result.modifiedCount > 0
  },

  async delete(id) {
    const result = await db.collection('products').deleteOne({ _id: id })
    return result.deletedCount > 0
  },

  async getByCategoryId(categoryId) {
    const products = await db
      .collection('products')
      .find({
        $or: [
          { 'categoryHierarchy.mainCategory': categoryId },
          { 'categoryHierarchy.subCategory': categoryId },
          { 'categoryHierarchy.leafCategory': categoryId },
        ],
      })
      .toArray()
    return products
  },

  async search(query) {
    const products = await db
      .collection('products')
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .toArray()
    return products
  },
}

export default productRepo
