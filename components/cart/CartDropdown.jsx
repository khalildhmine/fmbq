'use client'

import { Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Transition } from '@headlessui/react'
import { useUserInfo } from '@/hooks'
import { useAppSelector } from '@/hooks'
import { formatNumber } from '@/utils'
import CartBadge from './CartBadge'
import CartItem from './CartItem'
import RedirectToLogin from '@/components/modals/RedirectToLogin'
import EmptyCart from '@/components/svgs/empty-cart.svg'
import Image from 'next/image'

const CartDropdown = () => {
  const router = useRouter()
  const { isVerify } = useUserInfo()
  const { totalItems, cartItems, totalDiscount, totalPrice } = useAppSelector(state => state.cart)

  const handleCheckout = () => {
    if (!isVerify) {
      router.push('/auth/login')
      return
    }
    router.push('/checkout/shipping')
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative">
        <CartBadge />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            {totalItems === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Image src={EmptyCart} alt="Empty Cart" width={120} height={120} />
                <p className="mt-4 text-gray-500">您的购物车是空的</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map(item => (
                    <CartItem key={item.itemID} item={item} isDropdown />
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>小计:</span>
                    <span>¥{formatNumber(totalPrice)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-500 mt-1">
                      <span>折扣:</span>
                      <span>-¥{formatNumber(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium mt-2">
                    <span>总计:</span>
                    <span>¥{formatNumber(totalPrice - totalDiscount)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    结算
                  </button>
                </div>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default CartDropdown
