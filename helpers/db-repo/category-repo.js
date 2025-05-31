import { Category } from '@/models'
import { connect } from '../db'
import Product from '@/models/Product'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../db'

// In-memory cache for categories (reduced cache time for testing)
const CACHE_DURATION = 60 * 1000 // 1 minute to ensure fresh data during development
let categoriesCache = {
  all: {
    data: null,
    timestamp: 0,
  },
  byId: new Map(),
  bySlug: new Map(),
  byLevel: new Map(),
}

// Function to validate and sanitize cache
const validateCache = cacheEntry => {
  if (!cacheEntry || !cacheEntry.data) return false
  if (Date.now() - cacheEntry.timestamp > CACHE_DURATION) return false
  return true
}

// Clear the entire cache
const clearCache = () => {
  console.log('[CategoryRepo] Clearing categories cache')
  categoriesCache = {
    all: {
      data: null,
      timestamp: 0,
    },
    byId: new Map(),
    bySlug: new Map(),
    byLevel: new Map(),
  }
}

// Helper to generate cache key for level
const getLevelCacheKey = level => {
  if (level === undefined || level === null) return 'all'
  return `level:${level}`
}

// Safely convert string ID to ObjectId
const safeObjectId = id => {
  try {
    if (!id) return null
    return new ObjectId(id)
  } catch (error) {
    console.error('[CategoryRepo] Invalid ObjectId:', id, error.message)
    return null
  }
}

// Log with request ID for tracking
const logOperation = (operation, message) => {
  const requestId = Math.random().toString(36).substring(2, 10)
  console.log(`[CategoryRepo][${requestId}][${operation}] ${message}`)
  return requestId
}

const getAll = async (query = {}, options = {}) => {
  const requestId = logOperation(
    'getAll',
    `Query: ${JSON.stringify(query)}, Options: ${JSON.stringify(options)}`
  )

  try {
    // Check for level-specific cache
    if (options.level !== undefined) {
      const levelCacheKey = getLevelCacheKey(options.level)
      const cachedLevelData = categoriesCache.byLevel.get(levelCacheKey)

      if (validateCache(cachedLevelData)) {
        console.log(
          `[CategoryRepo][${requestId}] Using cached level ${options.level} categories, count: ${cachedLevelData.data.length}`
        )
        return cachedLevelData.data
      }
    }

    // Connect to db with shorter timeout for diagnostics
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    // Build query with proper ObjectId handling
    const dbQuery = { ...query }

    // Apply options to query
    if (options.level !== undefined) {
      dbQuery.level = parseInt(options.level, 10)
    }

    if (options.parent) {
      const parentId = safeObjectId(options.parent)
      if (parentId) {
        dbQuery.parent = parentId
      }
    }

    console.log(`[CategoryRepo][${requestId}] Executing MongoDB query:`, JSON.stringify(dbQuery))

    // Execute with explicit timeout
    const categories = await collection.find(dbQuery).maxTimeMS(5000).toArray()

    console.log(`[CategoryRepo][${requestId}] Found ${categories.length} categories`)

    // Update cache
    if (options.level !== undefined) {
      const levelCacheKey = getLevelCacheKey(options.level)
      categoriesCache.byLevel.set(levelCacheKey, {
        data: categories,
        timestamp: Date.now(),
      })
    }

    return categories
  } catch (error) {
    console.error(`[CategoryRepo][${requestId}] Error fetching categories:`, error.message)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }
}

const getOne = async query => {
  const requestId = logOperation('getOne', `Query: ${JSON.stringify(query)}`)

  try {
    // Check for ID cache
    if (query._id) {
      const idStr = query._id.toString()
      const cachedCategory = categoriesCache.byId.get(idStr)
      if (validateCache(cachedCategory)) {
        console.log(`[CategoryRepo][${requestId}] Using cached category for ID: ${idStr}`)
        return cachedCategory.data
      }
    }

    // Check for slug cache
    if (query.slug) {
      const cachedCategory = categoriesCache.bySlug.get(query.slug)
      if (validateCache(cachedCategory)) {
        console.log(`[CategoryRepo][${requestId}] Using cached category for slug: ${query.slug}`)
        return cachedCategory.data
      }
    }

    // Connect with direct driver
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    // Process the query to handle ObjectIds properly
    const dbQuery = { ...query }

    if (query._id) {
      const objId = safeObjectId(query._id)
      if (objId) {
        dbQuery._id = objId
      }
    }

    console.log(`[CategoryRepo][${requestId}] MongoDB findOne query:`, JSON.stringify(dbQuery))

    // Execute query with explicit timeout
    const category = await collection.findOne(dbQuery, { maxTimeMS: 5000 })

    if (!category) {
      console.log(`[CategoryRepo][${requestId}] Category not found`)
      throw new Error('Category not found')
    }

    console.log(`[CategoryRepo][${requestId}] Category found: ${category.name}`)

    // Update cache
    categoriesCache.byId.set(category._id.toString(), {
      data: category,
      timestamp: Date.now(),
    })

    if (category.slug) {
      categoriesCache.bySlug.set(category.slug, {
        data: category,
        timestamp: Date.now(),
      })
    }

    return category
  } catch (error) {
    console.error(`[CategoryRepo][${requestId}] Error fetching category:`, error.message)
    throw new Error(`Failed to fetch category: ${error.message}`)
  }
}

const create = async data => {
  const requestId = logOperation('create', `Creating new category: ${data.name}`)

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    // Process parent as ObjectId if provided
    if (data.parent) {
      data.parent = safeObjectId(data.parent)
    }

    // Ensure level is a number
    if (data.level !== undefined) {
      data.level = parseInt(data.level, 10)
    }

    // Add timestamps
    data.createdAt = new Date()
    data.updatedAt = new Date()

    const result = await collection.insertOne(data)

    // Clear cache after modification
    clearCache()

    console.log(`[CategoryRepo][${requestId}] Created category with ID: ${result.insertedId}`)

    return { _id: result.insertedId, ...data }
  } catch (error) {
    console.error(`[CategoryRepo][${requestId}] Error creating category:`, error.message)
    throw new Error(`Failed to create category: ${error.message}`)
  }
}

const _delete = async id => {
  const requestId = logOperation('delete', `Deleting category: ${id}`)

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    const objectId = safeObjectId(id)
    if (!objectId) throw new Error('Invalid category ID')

    const result = await collection.deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      throw new Error('Category not found')
    }

    // Clear cache after deletion
    clearCache()

    console.log(`[CategoryRepo][${requestId}] Category deleted: ${id}`)

    return { success: true, message: 'Category deleted' }
  } catch (error) {
    console.error(`[CategoryRepo][${requestId}] Error deleting category:`, error.message)
    throw new Error(`Failed to delete category: ${error.message}`)
  }
}

const update = async (id, data) => {
  const requestId = logOperation('update', `Updating category: ${id}`)

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    // Process parent as ObjectId if provided
    if (data.parent) {
      data.parent = safeObjectId(data.parent)
    }

    // Ensure level is a number
    if (data.level !== undefined) {
      data.level = parseInt(data.level, 10)
    }

    // Update timestamp
    data.updatedAt = new Date()

    const objectId = safeObjectId(id)
    if (!objectId) throw new Error('Invalid category ID')

    const result = await collection.updateOne({ _id: objectId }, { $set: data })

    if (result.matchedCount === 0) {
      throw new Error('Category not found')
    }

    // Clear cache to ensure fresh data
    clearCache()

    console.log(`[CategoryRepo][${requestId}] Category updated: ${id}`)

    // Get the updated category
    return collection.findOne({ _id: objectId })
  } catch (error) {
    console.error(`[CategoryRepo][${requestId}] Error updating category:`, error.message)
    throw new Error(`Failed to update category: ${error.message}`)
  }
}

const getById = async id => {
  return getOne({ _id: id })
}

const getBySlug = async slug => {
  return getOne({ slug })
}

export const categoryRepo = {
  getAll,
  getOne,
  create,
  update,
  delete: _delete,
  getById,
  getBySlug,
  clearCache,
}
