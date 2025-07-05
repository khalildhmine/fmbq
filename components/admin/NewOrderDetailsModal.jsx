'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import Image from 'next/image'
import { formatPrice } from '@/utils/formatNumber'
import { formatDate } from '@/utils/formatDate'
import { X } from 'lucide-react'

const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

const OrderItemSkeleton = () => (
  <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
    <LoadingSkeleton className="w-20 h-20 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <LoadingSkeleton className="h-4 w-3/4" />
      <div className="space-y-1">
        <LoadingSkeleton className="h-3 w-24" />
        <LoadingSkeleton className="h-3 w-32" />
        <LoadingSkeleton className="h-3 w-28" />
      </div>
      <div className="flex gap-2 items-center mt-1">
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
)

export default function NewOrderDetailsModal({ open, onClose, order }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isItemsLoading, setIsItemsLoading] = useState(true)

  useEffect(() => {
    if (order) {
      // Main content loads faster
      const mainTimer = setTimeout(() => setIsLoading(false), 500)

      // Items take longer to load
      const itemsTimer = setTimeout(() => setIsItemsLoading(false), 1200)

      return () => {
        clearTimeout(mainTimer)
        clearTimeout(itemsTimer)
      }
    }
  }, [order])

  if (!order) return null

  // Extract the actual order data - handle nested structure
  const orderData = order.order || order

  // Extract items from either items, cart, or nested structure
  const items = orderData.items || orderData.cart || []

  // Extract pricing information with fallbacks
  const subtotal = orderData.subtotalBeforeDiscounts || 0
  const discount = orderData.totalDiscount || 0
  const total = orderData.totalPrice || orderData.amount || 0

  // Extract customer information
  const customer = orderData.user || orderData.customer || {}
  const customerName = customer.name || orderData.customer || 'Anonymous'
  const customerEmail = customer.email || ''
  const customerMobile = orderData.mobile || ''

  // Extract address information
  const address = orderData.address || orderData.shippingAddress || null

  // Extract payment information
  const paymentMethod = orderData.paymentMethod || 'N/A'
  const paymentStatus =
    orderData.paymentStatus || orderData.paymentVerification?.status || 'pending'
  const paymentVerification = orderData.paymentVerification || {}

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg">
            {/* Header */}
            <div className="border-b p-4 flex justify-between items-center">
              <div>
                {isLoading ? (
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-6 w-48" />
                    <LoadingSkeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">
                      Order #{orderData.orderId || orderData._id}
                    </h2>
                    <p className="text-sm text-gray-500">{formatDate(orderData.createdAt)}</p>
                  </>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-bold mb-2">Customer Information</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <LoadingSkeleton className="h-5 w-40" />
                      <LoadingSkeleton className="h-4 w-32" />
                      <LoadingSkeleton className="h-4 w-36" />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">{customerName}</p>
                      {customerEmail && <p className="text-sm text-gray-500">{customerEmail}</p>}
                      {customerMobile && <p className="text-sm text-gray-500">{customerMobile}</p>}
                    </>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-bold mb-2">Shipping Address</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <LoadingSkeleton className="h-4 w-48" />
                      <LoadingSkeleton className="h-4 w-40" />
                      <LoadingSkeleton className="h-4 w-44" />
                    </div>
                  ) : address ? (
                    <div className="text-sm">
                      <p>{address.street}</p>
                      <p>{address.area}</p>
                      <p>
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No address provided</p>
                  )}
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-bold mb-2">Payment Information</h3>
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <LoadingSkeleton className="h-4 w-20" />
                          <LoadingSkeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-1">
                          <LoadingSkeleton className="h-4 w-20" />
                          <LoadingSkeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <LoadingSkeleton className="h-32 w-48" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Method:</p>
                          <p className="font-medium">{paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status:</p>
                          <p className="capitalize font-medium">{paymentStatus}</p>
                        </div>
                      </div>
                      {paymentVerification?.image && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">Payment Verification</p>
                          <Image
                            src={paymentVerification.image}
                            alt="Payment verification"
                            width={200}
                            height={100}
                            className="rounded-lg border"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Order Status */}
                <div>
                  <h3 className="font-bold mb-2">Order Status</h3>
                  {isLoading ? (
                    <LoadingSkeleton className="h-5 w-24" />
                  ) : (
                    <p className="capitalize font-medium">{orderData.status || 'pending'}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Order Items</h3>
                  {isItemsLoading && (
                    <span className="text-sm text-blue-600 animate-pulse">Loading items...</span>
                  )}
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {isItemsLoading ? (
                    // Enhanced loading skeletons for items
                    <>
                      <OrderItemSkeleton />
                      <OrderItemSkeleton />
                      <OrderItemSkeleton />
                    </>
                  ) : items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={item._id || index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Quantity: {item.quantity}</p>
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <span>Color: {item.color.name}</span>
                                <span
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: item.color.hashCode }}
                                />
                              </div>
                            )}
                            {item.size && <p>Size: {item.size.size}</p>}
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold">
                              {formatPrice(item.price || item.discountedPrice)} MRU
                            </span>
                            {item.discount > 0 && (
                              <span className="ml-2 text-sm text-gray-400 line-through">
                                {formatPrice(item.originalPrice)} MRU
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items found in this order</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-bold mb-3">Order Summary</h3>
                  {isItemsLoading ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <LoadingSkeleton className="h-4 w-32" />
                        <LoadingSkeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between">
                        <LoadingSkeleton className="h-4 w-28" />
                        <LoadingSkeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <LoadingSkeleton className="h-5 w-20" />
                        <LoadingSkeleton className="h-5 w-28" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal before discounts:</span>
                        <span>{formatPrice(subtotal)} MRU</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Total discount:</span>
                          <span>-{formatPrice(discount)} MRU</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatPrice(total)} MRU</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
