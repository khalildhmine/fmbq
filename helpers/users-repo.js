import { connectToDatabase } from './db'
import { ObjectId } from 'mongodb'

export const usersRepo = {
  async getById(id) {
    try {
      console.log('[UsersRepo] Getting user by ID:', id)
      const { db } = await connectToDatabase()
      const objectId = new ObjectId(id)
      const user = await db.collection('users').findOne({ _id: objectId })
      if (!user) {
        console.log('[UsersRepo] User not found')
        return null
      }
      return user
    } catch (error) {
      console.error('[UsersRepo] Error getting user by ID:', error)
      throw error
    }
  },

  async update(id, updateData) {
    try {
      console.log('[UsersRepo] Updating user:', id, updateData)
      const { db } = await connectToDatabase()
      const objectId = new ObjectId(id)

      const result = await db
        .collection('users')
        .findOneAndUpdate(
          { _id: objectId },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        )

      // In newer versions of MongoDB, the result is directly the updated document
      if (!result) {
        console.log('[UsersRepo] Update failed - user not found')
        throw new Error('User not found')
      }

      console.log('[UsersRepo] Update successful')
      return result
    } catch (error) {
      console.error('[UsersRepo] Error updating user:', error)
      throw error
    }
  },
}
