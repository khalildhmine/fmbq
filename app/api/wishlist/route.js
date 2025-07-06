import joi from 'joi'
import Wishlist from '@/models/Wishlist'
import mongoose from 'mongoose'
import { apiHandler, setJson } from '@/helpers/api/api-handler'
import Product from '@/models/Product'

const getWishlist = apiHandler(
  async req => {
    try {
      // Try to get userId from headers or query
      let userId = req.headers.get('userId')
      if (!userId && req.query) {
        userId = req.query.userId
      }

      console.log('Getting wishlist for userId:', userId)

      // Defensive: ensure userId is present
      if (!userId) {
        return Response.json(
          { success: false, message: 'No userId provided for wishlist', data: [] },
          { status: 200 }
        )
      }

      // Fetch wishlist items and populate product
      const wishlistItems = await Wishlist.find({ user: userId }).populate({
        path: 'product',
        model: 'product', // Use lowercase to match Product.js registration
      })

      // Defensive: filter out items with null product to avoid .images error
      const safeWishlist = wishlistItems
        .filter(item => item.product)
        .map(item => ({
          ...item.toObject(),
          product: item.product,
        }))

      return setJson({
        code: 200,
        message: 'ok',
        data: safeWishlist,
      })
    } catch (error) {
      console.error('Wishlist fetch error:', error)
      return setJson({
        code: 500,
        message: error.message,
        data: [],
      })
    }
  },
  { isJwt: true }
)

export async function POST(req) {
  try {
    const { userId, productId } = await req.json()

    console.log('Add to wishlist:', { userId, productId })

    // Defensive: ensure userId is present and valid
    if (!userId) {
      return Response.json(
        { success: false, message: 'User ID is required for wishlist.' },
        { status: 400 }
      )
    }
    if (!productId) {
      return Response.json(
        { success: false, message: 'Product ID is required for wishlist.' },
        { status: 400 }
      )
    }

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
      .populate({
        path: 'product',
        model: 'product',
        select: '_id title price images',
      })
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
}

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

// Ensure these exports appear only ONCE at the end of the file:
export const DELETE = removeFromWishlist
export const GET = getWishlist
export const dynamic = 'force-dynamic'
