import joi from 'joi'
import Wishlist from '@/models/Wishlist'
import { Product } from '@/models'
import { apiHandler, setJson } from '@/helpers/api/api-handler'

const getWishlist = apiHandler(
  async req => {
    try {
      const userId = req.headers.get('userId')
      console.log('Getting wishlist for userId:', userId)

      // Handle case when userId is null
      if (!userId) {
        console.log('No userId provided for wishlist')
        return setJson({
          code: 200,
          message: 'ok',
          data: [],
        })
      }

      const wishlistItems = await Wishlist.find({
        user: userId,
      })
        .populate({
          path: 'product',
          model: Product,
          select: '_id title price images description discount inStock', // Added more fields
        })
        .lean()

      // Transform the response to include proper image URLs
      const transformedItems = wishlistItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.images?.[0]?.url || null, // Use first image as main
          images: item.product.images || [], // Include all images
        },
      }))

      console.log(`Found ${wishlistItems.length} items for user ${userId}:`, wishlistItems)

      return setJson({
        code: 200,
        message: 'ok',
        data: transformedItems,
      })
    } catch (error) {
      console.error('Wishlist fetch error:', error)
      return setJson({ code: 500, message: error.message, data: [] })
    }
  },
  { isJwt: true }
)

const addToWishlist = apiHandler(
  async req => {
    try {
      const userId = req.headers.get('userId')
      const { productId } = await req.json()

      console.log('Add to wishlist:', { userId, productId })

      const existing = await Wishlist.findOne({
        user: userId,
        product: productId,
      })

      if (existing) {
        return setJson({
          code: 200,
          message: 'Already in wishlist',
          data: existing,
        })
      }

      const item = await Wishlist.create({
        user: userId,
        product: productId,
      })

      const populated = await Wishlist.findById(item._id)
        .populate('product', '_id title price image')
        .lean()

      return setJson({
        code: 200,
        message: 'Added to wishlist',
        data: populated,
      })
    } catch (error) {
      console.error('Add to wishlist error:', error)
      return setJson({ code: 500, message: error.message })
    }
  },
  {
    isJwt: true,
    schema: joi.object({
      productId: joi.string().required(),
    }),
  }
)

const removeFromWishlist = apiHandler(
  async req => {
    try {
      const userId = req.headers.get('userId')
      const { productId } = await req.json()

      console.log('Remove from wishlist:', { userId, productId })

      const result = await Wishlist.findOneAndDelete({
        user: userId,
        product: productId,
      })

      if (!result) {
        console.log('Item not found in wishlist')
        return setJson({
          code: 404,
          message: 'Item not found in wishlist',
          data: null,
        })
      }

      console.log('Successfully removed item:', result)
      return setJson({
        code: 200,
        message: 'Removed from wishlist',
        data: result,
      })
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      return setJson({
        code: 500,
        message: error.message,
        data: null,
      })
    }
  },
  {
    isJwt: true,
    schema: joi.object({
      productId: joi.string().required(),
    }),
  }
)

export const POST = addToWishlist
export const DELETE = removeFromWishlist
export const GET = getWishlist
export const dynamic = 'force-dynamic'
