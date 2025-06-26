import { db } from '@/helpers'
import { History, Product } from '@/models'
import { apiHandler } from '@/helpers/api'
import { setJson } from '@/helpers/api'

// Get user's history
export const GET = apiHandler(async req => {
  try {
    const userId = req.headers.get('userId')

    // If no userId, return empty history (client will use local storage)
    if (!userId) {
      return setJson({
        code: 200,
        message: 'No user ID provided, using local storage only',
        data: [],
      })
    }

    const history = await History.find({ user: userId })
      .populate({
        path: 'productId',
        model: Product,
        select: '_id title price images description discount inStock',
      })
      .sort({ lastViewed: -1 })
      .lean()

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
    const { productId } = await req.json()

    // If no userId, don't save to database
    if (!userId) {
      return setJson({
        code: 200,
        message: 'No user ID provided, using local storage only',
      })
    }

    if (!productId) {
      return setJson({
        code: 400,
        message: 'Missing product ID',
      })
    }

    // Find existing history entry
    let historyEntry = await History.findOne({
      user: userId,
      productId,
    })

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
    } else {
      // Create new entry
      historyEntry = await History.create({
        user: userId,
        productId,
        lastViewed: new Date(),
        viewCount: 1,
      })

      historyEntry = await History.findById(historyEntry._id).populate({
        path: 'productId',
        select: '_id title price images description discount inStock',
      })
    }

    return setJson({
      code: 200,
      message: 'History updated successfully',
      data: historyEntry,
    })
  } catch (error) {
    console.error('Error updating history:', error)
    return setJson({
      code: 500,
      message: 'Failed to update history',
      error: error.message,
    })
  }
})

export const dynamic = 'force-dynamic'
