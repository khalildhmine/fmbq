import bcrypt from 'bcryptjs'
import { auth } from '../auth'
import { connectToDatabase } from '../db'
import User from '@/models/User'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

// Operation timeout in milliseconds
const OPERATION_TIMEOUT_MS = 5000

// Safely convert string ID to ObjectId
const safeObjectId = id => {
  try {
    if (!id) return null
    return new ObjectId(id)
  } catch (error) {
    console.error('[UsersRepo] Invalid ObjectId:', id, error.message)
    return null
  }
}

const getAll = async ({ page, page_size }) => {
  try {
    console.log('[UsersRepo] Fetching all users, page:', page, 'size:', page_size)
    const { db } = await connectToDatabase()

    // Convert to numbers
    const pageNum = parseInt(page) || 1
    const pageSizeNum = parseInt(page_size) || 10

    // Calculate skip
    const skip = (pageNum - 1) * pageSizeNum

    // Get total count (with timeout)
    const usersLength = await db
      .collection('users')
      .countDocuments({}, { maxTimeMS: OPERATION_TIMEOUT_MS })

    // Get users (with timeout)
    const users = await db
      .collection('users')
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .maxTimeMS(OPERATION_TIMEOUT_MS)
      .toArray()

    return {
      users,
      usersLength,
      pagination: {
        currentPage: pageNum,
        nextPage: pageNum + 1,
        previousPage: pageNum - 1,
        hasNextPage: pageSizeNum * pageNum < usersLength,
        hasPreviousPage: pageNum > 1,
        lastPage: Math.ceil(usersLength / pageSizeNum),
      },
    }
  } catch (error) {
    console.error('[UsersRepo] Error fetching users:', error.message)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}

const update = async (id, params) => {
  try {
    console.log('[UsersRepo] Updating user:', id)
    const { db } = await connectToDatabase()

    let query = {}

    // Try different approaches to find the user
    if (typeof id === 'string' && id.length === 24) {
      // It looks like a valid ObjectId string, try with ObjectId first
      try {
        const objectId = safeObjectId(id)
        if (objectId) {
          console.log('[UsersRepo] Using ObjectId for update:', objectId)
          query = { _id: objectId }
        } else {
          query = { _id: id } // Fallback to string ID
        }
      } catch (err) {
        console.log('[UsersRepo] ObjectId conversion failed, using string ID for update')
        query = { _id: id }
      }
    } else {
      try {
        const objectId = safeObjectId(id)
        if (objectId) {
          query = { _id: objectId }
        } else {
          query = { _id: id }
        }
      } catch (err) {
        query = { _id: id }
      }
    }

    console.log('[UsersRepo] Update query:', JSON.stringify(query))

    // Check if user exists
    const user = await db.collection('users').findOne(query, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (!user) {
      console.error('[UsersRepo] User not found for update with query:', JSON.stringify(query))
      throw new Error('User not found')
    }

    // Update timestamp
    params.updatedAt = new Date()

    console.log('[UsersRepo] Updating user with params:', JSON.stringify(params))

    // Update user
    const result = await db
      .collection('users')
      .updateOne(query, { $set: params }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (result.matchedCount === 0) {
      throw new Error('User not found')
    }

    console.log('[UsersRepo] Update result:', JSON.stringify(result))

    // Fetch and return the updated user
    const updatedUser = await db
      .collection('users')
      .findOne(query, { maxTimeMS: OPERATION_TIMEOUT_MS })

    return updatedUser
  } catch (error) {
    console.error('[UsersRepo] Error updating user:', error.message)
    throw new Error(`Failed to update user: ${error.message}`)
  }
}

const create = async userData => {
  try {
    console.log('[UsersRepo] Creating user:', userData.email)

    // Connect to database with retry
    let db = null
    let retryCount = 0
    const maxRetries = 3

    while (!db && retryCount < maxRetries) {
      try {
        const connection = await connectToDatabase()
        db = connection.db
        if (!db) {
          throw new Error('Database connection returned undefined db object')
        }
      } catch (connError) {
        retryCount++
        console.error(`[UsersRepo] Connection attempt ${retryCount} failed:`, connError.message)
        // Wait before retry
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    // Check if db is properly initialized
    if (!db) {
      console.error('[UsersRepo] Database connection failed after multiple attempts')
      throw new Error('Database connection failed')
    }

    // Verify collection exists
    if (!db.collection) {
      console.error('[UsersRepo] Invalid db object - collection method not available')
      throw new Error('Invalid database connection')
    }

    // Check for existing user with same email
    const existingUser = await db.collection('users').findOne({ email: userData.email })
    if (existingUser) {
      const error = new Error('User with this email already exists')
      error.name = 'UserExistsError'
      throw error
    }

    // Check for existing user with same mobile if mobile is provided
    if (userData.mobile) {
      const existingMobileUser = await db.collection('users').findOne({ mobile: userData.mobile })
      if (existingMobileUser) {
        const error = new Error('User with this mobile number already exists')
        error.name = 'UserExistsError'
        throw error
      }
    }

    // Create user document with hashed password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    const newUser = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert the new user
    const result = await db.collection('users').insertOne(newUser)

    if (!result.acknowledged) {
      throw new Error('Failed to create user')
    }

    // Get the created user (without password)
    const createdUser = await db
      .collection('users')
      .findOne({ _id: result.insertedId }, { projection: { password: 0 } })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: createdUser._id,
        email: createdUser.email,
        role: createdUser.role || 'user',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    console.log('[UsersRepo] User created successfully:', createdUser.email)

    return {
      success: true,
      user: createdUser,
      token,
    }
  } catch (error) {
    console.error('[UsersRepo] Error creating user:', error.message)
    throw error
  }
}

const _delete = async id => {
  try {
    console.log('[UsersRepo] Deleting user:', id)
    const { db } = await connectToDatabase()

    const objectId = safeObjectId(id)
    if (!objectId) throw new Error('Invalid user ID')

    const result = await db
      .collection('users')
      .deleteOne({ _id: objectId }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (result.deletedCount === 0) {
      throw new Error('User not found')
    }

    return { success: true, message: 'User deleted' }
  } catch (error) {
    console.error('[UsersRepo] Error deleting user:', error.message)
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

const resetPassword = async (id, password) => {
  try {
    console.log('[UsersRepo] Resetting password for user:', id)
    const { db } = await connectToDatabase()

    const objectId = safeObjectId(id)
    if (!objectId) throw new Error('Invalid user ID')

    // Hash password
    const hashPassword = await bcrypt.hash(password, 12)

    // Update user password
    const result = await db
      .collection('users')
      .updateOne(
        { _id: objectId },
        { $set: { password: hashPassword, updatedAt: new Date() } },
        { maxTimeMS: OPERATION_TIMEOUT_MS }
      )

    if (result.matchedCount === 0) {
      throw new Error('User not found')
    }

    return { success: true, message: 'Password reset successful' }
  } catch (error) {
    console.error('[UsersRepo] Error resetting password:', error.message)
    throw new Error(`Failed to reset password: ${error.message}`)
  }
}

const getById = async id => {
  try {
    console.log('[UsersRepo] Getting user by ID:', id)
    const { db } = await connectToDatabase()

    let query = {}

    // Try different approaches to find the user
    if (typeof id === 'string' && id.length === 24) {
      // It looks like a valid ObjectId string, try with ObjectId first
      try {
        const objectId = safeObjectId(id)
        if (objectId) {
          console.log('[UsersRepo] Looking up with ObjectId:', objectId)
          query = { $or: [{ _id: objectId }, { _id: id }] }
        } else {
          query = { _id: id } // Fallback to string ID
        }
      } catch (err) {
        console.log('[UsersRepo] ObjectId conversion failed, using string ID')
        query = { _id: id }
      }
    } else {
      // Try both ObjectId and string ID
      try {
        const objectId = safeObjectId(id)
        if (objectId) {
          console.log('[UsersRepo] Using mixed query with ObjectId and string')
          query = { $or: [{ _id: objectId }, { _id: id }] }
        } else {
          query = { _id: id }
        }
      } catch (err) {
        query = { _id: id }
      }
    }

    console.log('[UsersRepo] Final query:', JSON.stringify(query))

    const user = await db.collection('users').findOne(query, { maxTimeMS: OPERATION_TIMEOUT_MS })

    if (!user) {
      console.error('[UsersRepo] User not found with query:', JSON.stringify(query))
      throw new Error('User not found')
    }

    console.log('[UsersRepo] Found user:', user._id)
    return user
  } catch (error) {
    console.error('[UsersRepo] Error getting user by ID:', error.message)
    throw new Error(`User not found: ${error.message}`)
  }
}

const getOne = async filter => {
  try {
    console.log('[UsersRepo] Getting user with filter:', JSON.stringify(filter))
    const { db } = await connectToDatabase()

    const user = await db.collection('users').findOne(filter, { maxTimeMS: OPERATION_TIMEOUT_MS })

    return user
  } catch (error) {
    console.error('[UsersRepo] Error getting user with filter:', error.message)
    throw new Error(`Failed to find user: ${error.message}`)
  }
}

const findUserByEmail = async email => {
  try {
    console.log('[UsersRepo] Looking up user by email:', email)
    const { db } = await connectToDatabase()

    const user = await db
      .collection('users')
      .findOne({ email }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    return user
  } catch (error) {
    console.error('[UsersRepo] Error looking up user:', error.message)
    throw new Error(`Error looking up user: ${error.message}`)
  }
}

const findUserByMobile = async mobile => {
  try {
    console.log('[UsersRepo] Looking up user by mobile:', mobile)
    const { db } = await connectToDatabase()

    const user = await db
      .collection('users')
      .findOne({ mobile }, { maxTimeMS: OPERATION_TIMEOUT_MS })

    return user
  } catch (error) {
    console.error('[UsersRepo] Error looking up user by mobile:', error.message)
    throw new Error(`Error looking up user: ${error.message}`)
  }
}

const authenticate = async (email, password) => {
  try {
    console.log('[UsersRepo] Authenticating user:', email)

    // Find user by email
    const user = await findUserByEmail(email)

    if (!user) {
      console.log('[UsersRepo] Authentication failed: User not found')
      throw new Error('Invalid email or password')
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('[UsersRepo] Authentication failed: Invalid password')
      throw new Error('Invalid email or password')
    }

    return user
  } catch (error) {
    console.error('[UsersRepo] Authentication error:', error.message)
    throw new Error(`Error looking up user: ${error.message}`)
  }
}

export const userRepo = {
  authenticate,
  create,
  getAll,
  getById,
  getOne,
  update,
  delete: _delete,
  resetPassword,
  findUserByEmail,
  findUserByMobile,
}

// Also export as usersRepo for backward compatibility
export const usersRepo = userRepo
