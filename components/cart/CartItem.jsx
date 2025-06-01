'use client'

import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { removeFromCart } from '@/store/slices/cart.slice'
import { formatNumber } from '@/utils'
import SpecialSell from '@/components/product/SpecialSell'
import CartButtons from './CartButtons'
import Icons from '@/components/common/Icons'
import DiscountCartItem from '@/components/cart/DiscountCartItem'
import ResponsiveImage from '@/components/common/ResponsiveImage'

const CartItem = ({ item, isDropdown = false }) => {
  const dispatch = useDispatch()

  const imageUrl = item.images?.find(img => img.primary)?.url || item.images?.[0]?.url || ''
  const finalPrice = item.finalPrice || item.price
  const hasDiscount = item.discount > 0

  return (
    <div className="flex gap-x-2 p-3 bg-white rounded-lg shadow">
      <Link href={`/products/${item.productID}`} className="relative w-20 h-20">
        <ResponsiveImage src={imageUrl} alt={item.name} />
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-x-2">
          <Link
            href={`/products/${item.productID}`}
            className="text-sm font-medium line-clamp-2 hover:text-blue-600"
          >
            {item.name}
          </Link>

          {!isDropdown && (
            <button
              type="button"
              onClick={() => dispatch(removeFromCart(item.itemID))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icons.X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {(item.color || item.size) && (
          <div className="flex items-center gap-x-2 mt-1 text-xs text-gray-500">
            {item.color && (
              <div className="flex items-center gap-x-1">
                <span>颜色:</span>
                <span className="font-medium">{item.color.name}</span>
              </div>
            )}
            {item.size && (
              <div className="flex items-center gap-x-1">
                <span>尺寸:</span>
                <span className="font-medium">{item.size.size}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-auto">
          <div className="flex items-baseline gap-x-2">
            <span className="font-medium">¥{formatNumber(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ¥{formatNumber(item.price)}
              </span>
            )}
          </div>

          <CartButtons item={item} />
        </div>
      </div>
    </div>
  )
}

export default CartItem
