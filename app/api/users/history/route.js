import { db } from '@/helpers'
import { ProductHistory } from '@/models'
import { auth } from '@/helpers'
import { apiHandler } from '@/helpers/api'
import { setJson } from '@/helpers/api'
import History from '@/models/History'
import { Product } from '@/models'

// Get user's history
export const GET = apiHandler(async req => {
  try {
    const userId = req.headers.get('userId')
    console.log('Fetching history for user:', userId)

    const history = await History.find({ user: userId })
      .populate({
        path: 'productId',
        model: Product,
        select: '_id title price images description discount inStock',
      })
      .sort({ lastViewed: -1 })
      .lean()

    console.log(`Found ${history.length} history items`)

    return setJson({
      code: 200,
      message: 'History retrieved successfully',
      data: history,
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return setJson({
      code: 500,
      message: 'Failed to retrieve history',
      error: error.message,
    })
  }
})

// Add to history
export const POST = apiHandler(async req => {
  try {
    const userId = req.headers.get('userId')
    const { productId } = await req.json() // The productId will now be correctly extracted

    console.log('Adding to history:', { userId, productId })

    if (!userId || !productId) {
      console.log('Missing required fields:', { userId, productId })
      return setJson({
        code: 400,
        message: 'Missing required fields',
        error: 'UserId and productId are required',
      })
    }

    // Find existing history entry
    let historyEntry = await History.findOne({
      user: userId,
      productId,
    }).lean()

    if (historyEntry) {
      // Update existing entry
      historyEntry = await History.findOneAndUpdate(
        { user: userId, productId },
        {
          $set: { lastViewed: new Date() },
          $inc: { viewCount: 1 },
        },
        { new: true }
      ).populate({
        path: 'productId',
        select: '_id title price images description discount inStock',
      })

      console.log('Updated existing history entry:', historyEntry)
    } else {
      // Create new entry
      historyEntry = await History.create({
        user: userId,
        productId,
      })

      historyEntry = await History.findById(historyEntry._id)
        .populate({
          path: 'productId',
          select: '_id title price images description discount inStock',
        })
        .lean()

      console.log('Created new history entry:', historyEntry)
    }

    return setJson({
      code: 200,
      message: 'Added to history successfully',
      data: historyEntry,
    })
  } catch (error) {
    console.error('Error adding to history:', error)
    return setJson({
      code: 500,
      message: 'Failed to add to history',
      error: error.message,
    })
  }
})

export const dynamic = 'force-dynamic'
