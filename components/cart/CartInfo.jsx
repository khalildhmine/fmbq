import { formatNumber } from 'utils'

import { Button } from 'components'

import { useAppSelector } from 'hooks'

const CartInfo = ({ handleRoute, cart, appliedCoupon, showCouponDetails = true }) => {
  const { totalItems, totalPrice, totalDiscount } = useAppSelector(state => state.cart)
  const { userInfo } = useUserInfo()
  const [useCoins, setUseCoins] = useState(false)

  const baseDiscountedPrice = totalPrice - totalDiscount
  const couponDiscount = appliedCoupon
    ? Math.round((baseDiscountedPrice * appliedCoupon.discount) / 100)
    : 0

  // Calculate max coins that can be used (20% of price after coupon)
  const priceAfterCoupon = baseDiscountedPrice - couponDiscount
  const maxCoinsToUse = Math.min(userInfo?.coins || 0, Math.floor(priceAfterCoupon * 0.2))
  const coinsDiscount = useCoins ? maxCoinsToUse : 0

  const finalPrice = priceAfterCoupon - coinsDiscount

  // Calculate coins to be earned
  const potentialCoins = Math.floor(finalPrice / 10)

  return (
    <div className="px-4 py-2 mt-10 space-y-5 lg:mt-0 lg:h-fit lg:py-4">
      {/* Original Price */}
      <div className="pb-2 border-b border-gray-200 flex justify-between">
        <span className="text-sm">原始价格 ({formatNumber(totalItems)} 件商品)</span>
        <div className="flex-center">
          <span>{formatNumber(totalPrice)}</span>
          <span className="ml-1">MRU </span>
        </div>
      </div>

      {/* Product Discount */}
      <div className="flex justify-between">
        <span className="text-red-500">商品折扣</span>
        <div className="flex-center text-red-500">
          <span>-{formatNumber(totalDiscount)}</span>
          <span className="ml-1">MRU </span>
        </div>
      </div>

      {/* Coupon Discount if applied */}
      {showCouponDetails && appliedCoupon && (
        <div className="flex justify-between text-green-600">
          <span>优惠券折扣 ({appliedCoupon.code})</span>
          <div className="flex-center">
            <span>-{formatNumber(couponDiscount)}</span>
            <span className="ml-1">MRU </span>
          </div>
        </div>
      )}

      {userInfo?.coins > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">可用积分: {userInfo.coins}</span>
              <p className="text-xs text-gray-500">最多可抵扣 {maxCoinsToUse} 元</p>
            </div>
            <input
              type="checkbox"
              checked={useCoins}
              onChange={e => setUseCoins(e.target.checked)}
              className="form-checkbox"
            />
          </div>
          {useCoins && (
            <div className="flex justify-between text-green-600 mt-2">
              <span>积分抵扣</span>
              <span>-{coinsDiscount}MRU </span>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>完成订单后可得积分</span>
          <span>+{potentialCoins}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
        <span>最终价格</span>
        <div className="flex-center">
          <span>{formatNumber(finalPrice)}</span>
          <span className="ml-1">MRU </span>
        </div>
      </div>

      {cart && (
        <Button onClick={handleRoute} className="hidden w-full lg:block">
          继续
        </Button>
      )}
    </div>
  )
}

export default CartInfo
