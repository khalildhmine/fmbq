import joi from 'joi'
import Coupon from '@/models/coupon.model'
import { apiHandler, setJson } from '@/helpers/api'

const applyCoupon = apiHandler(
  async req => {
    try {
      const { code } = await req.json()
      console.log('Received coupon code:', code) // Log received coupon code

      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isValid: true,
        expiryDate: { $gt: new Date() },
      })

      if (!coupon) {
        console.log('Coupon not found or expired') // Log if coupon is not found or expired
        throw new Error('Invalid or expired coupon code')
      }

      console.log('Coupon found:', coupon) // Log found coupon details
      return setJson({
        data: coupon,
      })
    } catch (error) {
      console.error('Error applying coupon:', error) // Log detailed error
      throw new Error(error.message || 'Failed to apply coupon')
    }
  },
  {
    isJwt: true,
    schema: joi.object({
      code: joi.string().required(),
    }),
  }
)

export const POST = applyCoupon
export const dynamic = 'force-dynamic'
