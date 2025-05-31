import { setJson } from '@/helpers/api'
import { bannerRepo, sliderRepo } from '@/helpers/db-repo'
import { connectToDatabase } from '@/helpers/db'
import { ObjectId } from 'mongodb'

// Timeout for MongoDB operations
const OPERATION_TIMEOUT_MS = 5000

// These are internal fallbacks for core app functionality only
// They should not be visible to users in normal operation

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const requestId = Math.random().toString(36).substring(2, 8)
  console.log(`[Feed API][${requestId}] Request received`)

  try {
    const url = new URL(req.url)
    const categoryId = url.searchParams.get('categoryId')
    // Add an option to skip fallbacks for UI clients that don't want them
    const skipFallbacks = url.searchParams.get('skip_fallbacks') === 'true'

    console.log(`[Feed API][${requestId}] Requested category ID:`, categoryId || 'all')
    console.log(`[Feed API][${requestId}] Skip fallbacks:`, skipFallbacks)

    // Create virtual "All" category
    const allCategory = {
      _id: 'all',
      name: 'All',
      slug: 'all',
      colors: { start: '#000000', end: '#000000' },
    }

    let levelZeroCategories = []
    let currentCategory = allCategory
    let childCategories = []
    let usingFallbacks = false
    let errors = []

    // Get database connection
    const { db } = await connectToDatabase()

    // Try to fetch level 0 categories with increased timeout
    try {
      console.log(`[Feed API][${requestId}] Fetching level 0 categories`)
      const startTime = Date.now()

      // Use direct MongoDB driver
      levelZeroCategories = await db
        .collection('categories')
        .find({ level: 0 })
        .maxTimeMS(OPERATION_TIMEOUT_MS)
        .toArray()

      const duration = Date.now() - startTime
      console.log(
        `[Feed API][${requestId}] Retrieved ${levelZeroCategories.length} level 0 categories in ${duration}ms`
      )
    } catch (categoriesError) {
      console.error(
        `[Feed API][${requestId}] Error fetching level 0 categories:`,
        categoriesError.message
      )
      errors.push({
        component: 'levelZeroCategories',
        message: categoriesError.message,
      })

      // Use fallback categories if database query fails and fallbacks are allowed
      if (!skipFallbacks) {
        levelZeroCategories = []
        usingFallbacks = true
        console.log(`[Feed API][${requestId}] Using emergency fallback categories`)
      } else {
        console.log(`[Feed API][${requestId}] Skipping fallbacks as requested`)
        levelZeroCategories = []
      }
    }

    // Add "All" category at the beginning
    // Don't add if we already have an "all" in the results
    if (!levelZeroCategories.some(cat => cat._id === 'all' || cat.slug === 'all')) {
      levelZeroCategories.unshift(allCategory)
    }

    // Try to get current category if a specific ID was requested
    if (categoryId && categoryId !== 'all') {
      try {
        console.log(`[Feed API][${requestId}] Fetching requested category by ID: ${categoryId}`)

        // Use direct MongoDB driver
        let query = {}
        try {
          // Try to use as ObjectId
          query._id = new ObjectId(categoryId)
        } catch (err) {
          // If not a valid ObjectId, try as string ID
          query._id = categoryId
        }

        const foundCategory = await db
          .collection('categories')
          .findOne(query, { maxTimeMS: OPERATION_TIMEOUT_MS })

        if (foundCategory) {
          currentCategory = foundCategory
          console.log(`[Feed API][${requestId}] Found requested category:`, currentCategory.name)
        } else {
          throw new Error('Category not found')
        }
      } catch (categoryError) {
        console.error(
          `[Feed API][${requestId}] Error fetching requested category:`,
          categoryError.message
        )
        errors.push({
          component: 'currentCategory',
          message: categoryError.message,
        })
        // Keep 'all' as the current category if the requested one can't be found
      }
    }

    // Try to get child categories
    try {
      if (currentCategory._id === 'all') {
        // For "All" category, try to get all categories or use fallbacks
        try {
          console.log(`[Feed API][${requestId}] Fetching all categories as child categories`)
          const startTime = Date.now()

          // Use direct MongoDB driver
          childCategories = await db
            .collection('categories')
            .find({})
            .maxTimeMS(OPERATION_TIMEOUT_MS)
            .toArray()

          const duration = Date.now() - startTime
          console.log(
            `[Feed API][${requestId}] Retrieved ${childCategories.length} categories in ${duration}ms`
          )
        } catch (allCategoriesError) {
          console.error(
            `[Feed API][${requestId}] Error fetching all categories:`,
            allCategoriesError.message
          )
          errors.push({
            component: 'childCategories',
            message: allCategoriesError.message,
          })

          // Use fallbacks depending on flag
          if (!skipFallbacks) {
            childCategories = []
            usingFallbacks = true
          } else {
            childCategories = []
          }
        }
      } else {
        // For specific category, get its children
        try {
          console.log(
            `[Feed API][${requestId}] Fetching child categories for: ${currentCategory._id}`
          )
          const startTime = Date.now()

          // Construct query based on parent ID
          let query = {}
          try {
            // Try to use as ObjectId if it's not already a string
            query.parent =
              typeof currentCategory._id === 'string'
                ? currentCategory._id
                : new ObjectId(currentCategory._id)
          } catch (err) {
            // If not a valid ObjectId, use as is
            query.parent = currentCategory._id
          }

          // Use direct MongoDB driver
          childCategories = await db
            .collection('categories')
            .find(query)
            .maxTimeMS(OPERATION_TIMEOUT_MS)
            .toArray()

          const duration = Date.now() - startTime
          console.log(
            `[Feed API][${requestId}] Retrieved ${childCategories.length} child categories in ${duration}ms`
          )
        } catch (childrenError) {
          console.error(
            `[Feed API][${requestId}] Error fetching child categories:`,
            childrenError.message
          )
          errors.push({
            component: 'specificChildCategories',
            message: childrenError.message,
          })
          // Leave empty for specific categories if query fails
          childCategories = []
        }
      }
    } catch (err) {
      console.error(`[Feed API][${requestId}] Error in child categories logic:`, err.message)
      errors.push({
        component: 'childCategoriesLogic',
        message: err.message,
      })

      // Use fallbacks depending on flag
      if (!skipFallbacks) {
        childCategories = []
        usingFallbacks = true
      } else {
        childCategories = []
      }
    }

    console.log(`[Feed API][${requestId}] Retrieved ${childCategories.length} child categories`)

    // Get content with timeout protection
    const getWithTimeout = async (promiseFunc, name, timeoutMs = 3000) => {
      return new Promise(resolve => {
        let resolved = false

        // Set timeout
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            console.log(`[Feed API][${requestId}] ${name} timed out after ${timeoutMs}ms`)
            resolved = true
            resolve({ data: [], error: `${name} timed out after ${timeoutMs}ms` })
          }
        }, timeoutMs)

        // Execute promise
        promiseFunc()
          .then(result => {
            if (!resolved) {
              clearTimeout(timeoutId)
              resolved = true
              resolve({ data: result, error: null })
            }
          })
          .catch(err => {
            if (!resolved) {
              console.error(`[Feed API][${requestId}] Error in ${name}:`, err.message)
              clearTimeout(timeoutId)
              resolved = true
              resolve({ data: [], error: err.message })
            }
          })
      })
    }

    // Fetch sliders and banners with timeouts to prevent long loading
    console.log(`[Feed API][${requestId}] Fetching sliders and banners with timeouts`)

    const getSlidersPromise = () => {
      console.log(`[Feed API][${requestId}] Fetching sliders...`)
      return sliderRepo.getAll()
    }

    const getBannerOnePromise = () => {
      console.log(`[Feed API][${requestId}] Fetching banner type one...`)
      return bannerRepo.getAll({ type: 'one' })
    }

    const getBannerTwoPromise = () => {
      console.log(`[Feed API][${requestId}] Fetching banner type two...`)
      return bannerRepo.getAll({ type: 'two' })
    }

    const [slidersResult, bannerOneResult, bannerTwoResult] = await Promise.all([
      getWithTimeout(getSlidersPromise, 'sliders'),
      getWithTimeout(getBannerOnePromise, 'bannerOne'),
      getWithTimeout(getBannerTwoPromise, 'bannerTwo'),
    ])

    if (slidersResult.error) {
      errors.push({ component: 'sliders', message: slidersResult.error })
    }
    if (bannerOneResult.error) {
      errors.push({ component: 'bannerOne', message: bannerOneResult.error })
    }
    if (bannerTwoResult.error) {
      errors.push({ component: 'bannerTwo', message: bannerTwoResult.error })
    }

    console.log(`[Feed API][${requestId}] Retrieved content:`)
    console.log(`[Feed API][${requestId}] - Sliders: ${slidersResult.data.length}`)
    console.log(`[Feed API][${requestId}] - Banner One: ${bannerOneResult.data.length}`)
    console.log(`[Feed API][${requestId}] - Banner Two: ${bannerTwoResult.data.length}`)

    return setJson({
      status: 'success',
      data: {
        allCategories: levelZeroCategories,
        currentCategory,
        childCategories,
        sliders: slidersResult.data,
        bannerOne: bannerOneResult.data,
        bannerTwo: bannerTwoResult.data,
        usingFallbacks,
        requestId,
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error(`[Feed API] Error:`, error.message)
    return setJson(
      {
        status: 'error',
        message: error.message,
      },
      500
    )
  }
}
