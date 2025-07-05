'use client'

import React from 'react'
import { Dialog } from '@headlessui/react'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { formatPrice } from '@/utils/formatNumber'
import { formatDate } from '@/utils/formatDate'

const OrderItem = ({ item }) => {
  if (!item) return null

  // Get the item name from various possible sources
  const itemName =
    item.name ||
    item.title ||
    (item.productID && (item.productID.name || item.productID.title)) ||
    'Untitled Product'

  // Get the item image from various possible sources
  const itemImage =
    item.image ||
    (item.img && item.img.url) ||
    (item.productID && item.productID.image) ||
    (item.productID &&
      item.productID.images &&
      item.productID.images[0] &&
      (item.productID.images[0].url || item.productID.images[0])) ||
    '/placeholder.png'

  // Calculate the actual price and discount
  const originalPrice = parseFloat(item.originalPrice || item.price || 0)
  const finalPrice = parseFloat(item.discountedPrice || item.price || 0)
  const discount =
    item.discount ||
    (originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0)

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-20 h-20 relative rounded-md overflow-hidden">
        <Image src={itemImage} alt={itemName} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{itemName}</h4>
        <div className="mt-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Quantity: {item.quantity || 1}</span>
            {item.color && item.color.name && item.color.name !== 'Default' && (
              <div className="flex items-center gap-1">
                <span>Color:</span>
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: item.color.hashCode || '#000000' }}
                  title={item.color.name}
                />
                <span>{item.color.name}</span>
              </div>
            )}
            {item.size && item.size.size && item.size.size !== 'One Size' && (
              <div className="flex items-center gap-1">
                <span>Size:</span>
                <span className="font-medium">{item.size.size}</span>
              </div>
            )}
          </div>
          <div className="mt-1">
            <span className="font-medium text-gray-900">{formatPrice(finalPrice)} MRU</span>
            {discount > 0 && originalPrice > finalPrice && (
              <>
                <span className="mx-2 text-gray-400 line-through">
                  {formatPrice(originalPrice)} MRU
                </span>
                <span className="text-red-500">-{discount}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailsModal({ open, onClose, order }) {
  if (!order) return null

  const getOrderStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pending_verification':
        return 'warning'
      case 'processing':
      case 'picked':
      case 'shipped':
        return 'info'
      case 'delivered':
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Get payment status from either paymentStatus or paymentVerification
  const paymentStatus = order.paymentStatus || order.paymentVerification?.status || 'pending'

  // Get customer name from multiple possible sources
  const customerName = order.customer || order.user?.name || order.user?.email || 'Anonymous'

  // Get items from either items or cart array
  const orderItems = (order.items || order.cart || []).filter(Boolean)

  // Calculate totals
  const subtotalBeforeDiscounts =
    order.subtotalBeforeDiscounts ||
    orderItems.reduce((sum, item) => {
      const price = parseFloat(item.originalPrice || item.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + price * quantity
    }, 0)

  const totalDiscount =
    order.totalDiscount ||
    orderItems.reduce((sum, item) => {
      const originalPrice = parseFloat(item.originalPrice || item.price || 0)
      const finalPrice = parseFloat(item.discountedPrice || item.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + (originalPrice - finalPrice) * quantity
    }, 0)

  const totalPrice =
    order.totalPrice ||
    order.amount ||
    orderItems.reduce((sum, item) => {
      const price = parseFloat(item.discountedPrice || item.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + price * quantity
    }, 0)

  // Get shipping address from multiple possible sources
  const shippingAddress = order.address || order.shippingAddress

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-xl font-semibold">
                  Order #{order.orderId}
                </Dialog.Title>
                <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{customerName}</p>
                  {order.user?.email && <p className="text-gray-600">{order.user.email}</p>}
                  {order.mobile && <p className="text-gray-600">{order.mobile}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {shippingAddress ? (
                    <>
                      {shippingAddress.street && <p>{shippingAddress.street}</p>}
                      {shippingAddress.area && <p>{shippingAddress.area}</p>}
                      <p>
                        {[
                          shippingAddress.city,
                          shippingAddress.province,
                          shippingAddress.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No address provided</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {paymentStatus}
                    </Badge>
                  </div>
                  {order.paymentVerification?.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Payment Proof:</p>
                      <div className="relative h-40 w-full">
                        <Image
                          src={order.paymentVerification.image}
                          alt="Payment proof"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="space-y-4">
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => <OrderItem key={item._id || index} item={item} />)
                ) : (
                  <p className="text-gray-500 italic text-center py-4">No items found</p>
                )}

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal before discounts:</span>
                    <span>{formatPrice(subtotalBeforeDiscounts)} MRU</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Total Discount:</span>
                      <span>-{formatPrice(totalDiscount)} MRU</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice)} MRU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
