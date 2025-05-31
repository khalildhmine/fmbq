import { setJson, apiHandler } from '@/helpers/api'
import { couponRepo } from '@/helpers'

const applyCoupon = apiHandler(async req => {
  const { couponCode } = await req.json()
  const coupon = await couponRepo.getByCode(couponCode)

  if (!coupon || !coupon.isValid) {
    return setJson({
      message: 'Coupon is invalid or expired',
      discount: 0,
    })
  }

  return setJson({
    message: 'Coupon applied successfully',
    discount: coupon.discount,
  })
})

export const POST = applyCoupon
export const dynamic = 'force-dynamic'
