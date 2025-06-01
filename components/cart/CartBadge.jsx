'use client'

import { useAppSelector } from '@/hooks'
import { formatNumber } from '@/utils'
import Icons from '@/components/common/Icons'

const CartBadge = () => {
  const { totalItems } = useAppSelector(state => state.cart)

  return (
    <div className="relative">
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs text-white bg-red-500 rounded-full px-1">
          {formatNumber(totalItems)}
        </span>
      )}
      <Icons.ShoppingCart className="w-6 h-6" />
    </div>
  )
}

export default CartBadge
