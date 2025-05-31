import { db } from '../db'

const usersRepo = {
  async getById(id) {
    const user = await db.collection('users').findOne({ _id: id })
    return user
  },

  async getByEmail(email) {
    const user = await db.collection('users').findOne({ email })
    return user
  },

  async create(user) {
    const result = await db.collection('users').insertOne(user)
    return result.insertedId
  },

  async update(id, update) {
    const result = await db.collection('users').updateOne({ _id: id }, { $set: update })
    return result.modifiedCount > 0
  },

  async delete(id) {
    const result = await db.collection('users').deleteOne({ _id: id })
    return result.deletedCount > 0
  },
}

export default usersRepo
