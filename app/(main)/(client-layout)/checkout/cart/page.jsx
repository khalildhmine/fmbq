'use client'
import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'

import { clearCart, showAlert, applyCoupon as applyCouponAction } from 'store'
import { useApplyCouponMutation } from '@/store/services/product.service'

import {
  Icons,
  FreeShipping,
  CartItem,
  CartInfo,
  Header,
  RedirectToLogin,
  Button,
  EmptyCart,
} from 'components'
import { Menu, Transition } from '@headlessui/react'

import { formatNumber } from 'utils'

import { useUserInfo, useDisclosure, useAppSelector, useAppDispatch } from 'hooks'

const CartPage = () => {
  //? Assets
  const dispatch = useAppDispatch()
  const { push } = useRouter()

  const [isShowRedirectModal, redirectModalHandlers] = useDisclosure()
  const [couponCode, setCouponCode] = useState('')

  const [applyCouponMutation, { isLoading: isApplyingCoupon }] = useApplyCouponMutation()

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      dispatch(
        showAlert({
          status: 'error',
          title: 'Please enter a coupon code',
        })
      )
      return
    }

    try {
      const result = await applyCouponMutation({
        couponCode,
        totalAmount: totalPrice - totalDiscount,
      }).unwrap()

      if (result.success) {
        dispatch(
          applyCouponAction({
            code: couponCode,
            discount: result.discount,
            discountAmount: result.discountAmount,
          })
        )
        dispatch(
          showAlert({
            status: 'success',
            title: `优惠券已应用! 您节省了 ${result.discountAmount}MRU `,
          })
        )
      }
    } catch (error) {
      console.error('Coupon error:', error)
      dispatch(
        showAlert({
          status: 'error',
          title: error.data?.error || 'Failed to apply coupon',
        })
      )
    }
  }

  //? Get User Data
  const { userInfo } = useUserInfo()

  //? Store
  const { cartItems, totalItems, totalPrice, totalDiscount, appliedCoupon } = useAppSelector(
    state => state.cart
  )

  //? Handlers
  const handleRoute = () => {
    if (!userInfo) return redirectModalHandlers.open()

    push('/checkout/shipping')
  }

  // Add this section before the cart info section
  const CouponSection = () => (
    <section className="px-4 py-3 lg:border lg:border-gray-200 lg:rounded-md lg:mb-3">
      <div className="flex items-center gap-x-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-md"
        />
        <Button
          onClick={handleApplyCoupon}
          isLoading={isApplyingCoupon}
          className="whitespace-nowrap"
        >
          Apply Coupon
        </Button>
      </div>
      {appliedCoupon && (
        <div className="mt-2 text-green-600">
          Coupon {appliedCoupon.code} applied: {appliedCoupon.discount}% off
        </div>
      )}
    </section>
  )

  //? Local Components
  const DeleteAllDropDown = () => (
    <Menu as="div" className="dropdown">
      <Menu.Button className="dropdown__button">
        <Icons.More className="icon" />
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
        <Menu.Items className="w-32 dropdown__items ">
          <Menu.Item>
            <button onClick={() => dispatch(clearCart())} className="px-4 py-3 flex-center gap-x-2">
              <Icons.Delete className="icon" />
              <span>删除全部</span>
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )

  //? Render(s)
  if (cartItems.length === 0)
    return (
      <>
        <section className="py-2 mx-auto mb-20 space-y-3 xl:mt-36 lg:mb-0 container lg:px-5 lg:mt-6 lg:space-y-0 lg:py-4 lg:border lg:border-gray-200 lg:rounded-md">
          <div className="section-divide-y" />

          <div className="py-20">
            <EmptyCart className="mx-auto h-52 w-52" />
            <p className="text-base font-bold text-center">您的购物车是空的！</p>
          </div>
        </section>
      </>
    )

  return (
    <>
      <RedirectToLogin
        title="您还没有登录"
        text=""
        onClose={redirectModalHandlers.close}
        isShow={isShowRedirectModal}
      />
      <main className="container py-2 mx-auto mb-20 space-y-3 xl:mt-36 lg:py-0 lg:mb-0 b lg:px-5 lg:mt-6 lg:gap-x-3 lg:flex lg:flex-wrap lg:space-y-0">
        <div className="lg:py-4 lg:border lg:border-gray-200 lg:rounded-md lg:flex-1 h-fit">
          {/* title */}
          <section className="flex justify-between px-4">
            <div>
              <h3 className="mb-2 text-sm font-bold">您的购物车</h3>
              <span className="">{formatNumber(totalItems)} 件商品</span>
            </div>
            <DeleteAllDropDown />
          </section>

          {/* carts */}
          <section className="divide-y">
            {cartItems.map(item => (
              <CartItem item={item} key={item.itemID} />
            ))}
          </section>
        </div>

        <div className="section-divide-y lg:hidden" />

        {/* cart Info */}
        <section className="lg:sticky lg:top-6 lg:h-fit xl:top-36">
          <CouponSection />
          <div className="lg:border lg:border-gray-200 lg:rounded-md">
            <CartInfo handleRoute={handleRoute} cart appliedCoupon={appliedCoupon} />
          </div>
          <FreeShipping />
        </section>

        {/* to Shipping */}
        <section className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-3 bg-white border-t border-gray-300 shadow-3xl lg:hidden">
          <div>
            <span className="font-light">总计购物车</span>
            <div className="flex items-center">
              <span className="text-sm">{formatNumber(totalPrice - totalDiscount)}</span>
              <span className="ml-1">MRU </span>
            </div>
          </div>
          <Button className="w-1/2" onClick={handleRoute}>
            继续
          </Button>
        </section>
      </main>
    </>
  )
}

export default CartPage
