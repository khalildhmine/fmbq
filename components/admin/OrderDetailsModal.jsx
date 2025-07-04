'use client'

import { useState, useMemo } from 'react'
import { Dialog } from '@headlessui/react'
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  Maximize2,
  Minimize2,
  ShoppingBag,
  MapPinned,
  Banknote,
  Timer,
  Shield,
  Box,
  Tag,
  Sparkles,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

const formatDate = dateString => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('fr-FR', {
    timeZone: 'Africa/Nouakchott',
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

const formatPrice = price => {
  if (!price || isNaN(price)) return '0.00'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(price))
}

const ImageViewer = ({ url, alt }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!url) return null

  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-300 ${
          isExpanded
            ? 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4'
            : 'h-48 w-full'
        }`}
      >
        <Image
          src={url}
          alt={alt}
          fill={!isExpanded}
          width={isExpanded ? 1200 : undefined}
          height={isExpanded ? 800 : undefined}
          className={`${
            isExpanded ? 'max-h-[90vh] w-auto h-auto object-contain' : 'object-contain rounded-lg'
          }`}
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending':
      case 'pending_verification':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)} shadow-sm`}
    >
      {status?.replace('_', ' ').toUpperCase() || 'N/A'}
    </span>
  )
}

const PaymentVerificationControls = ({ order, onUpdateVerification }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleVerificationUpdate = async status => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/orders/${order._id}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update verification status')
      }

      const data = await response.json()
      if (data.success) {
        toast.success(`Payment verification ${status}`)
        onUpdateVerification && onUpdateVerification(data.order)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-xl font-semibold">Payment Verification</h3>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleVerificationUpdate('verified')}
          disabled={isUpdating}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 text-base font-medium shadow-lg hover:shadow-emerald-200 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Accept Payment
        </button>
        <button
          onClick={() => handleVerificationUpdate('pending')}
          disabled={isUpdating}
          className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all duration-200 text-base font-medium shadow-lg hover:shadow-amber-200 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Timer className="w-5 h-5" />
          Hold Payment
        </button>
        <button
          onClick={() => handleVerificationUpdate('rejected')}
          disabled={isUpdating}
          className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all duration-200 text-base font-medium shadow-lg hover:shadow-rose-200 hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          Reject Payment
        </button>
      </div>
    </div>
  )
}

const extractPaymentProofImage = order => {
  if (!order) return null

  // Direct check for the standard path
  if (order.paymentVerification?.image?.url) {
    console.log('Found image URL in standard path:', order.paymentVerification.image.url)
    return order.paymentVerification.image.url
  }

  // Check if image is a direct string URL
  if (typeof order.paymentVerification?.image === 'string') {
    console.log('Found direct image URL:', order.paymentVerification.image)
    return order.paymentVerification.image
  }

  // If we have _rawData, check there
  if (order._rawData?.paymentVerification?.image?.url) {
    console.log('Found image URL in _rawData:', order._rawData.paymentVerification.image.url)
    return order._rawData.paymentVerification.image.url
  }

  // Check for MongoDB format
  if (typeof order._id === 'object' && order._id.$oid) {
    if (order.paymentVerification?.image?.url) {
      console.log('Found image URL in MongoDB format:', order.paymentVerification.image.url)
      return order.paymentVerification.image.url
    }
  }

  // Last resort: Look for Cloudinary URLs in the entire object
  const str = JSON.stringify(order)
  const matches = str.match(/https?:\/\/res\.cloudinary\.com\/[^"]+/g)
  if (matches && matches.length > 0) {
    console.log('Found Cloudinary URL in JSON string:', matches[0])
    return matches[0]
  }

  console.log('No payment proof image found in order:', order)
  return null
}

const transformCartToItems = cart => {
  if (!Array.isArray(cart)) return []

  return cart.map(item => ({
    _id: item.productID || item._id,
    name: item.name || item.title || 'Product',
    image: item.image || item.img?.url || '/placeholder.png',
    quantity: item.quantity || 1,
    size: item.size || null,
    color: item.color || null,
    originalPrice: item.originalPrice || item.price || 0,
    discountedPrice: item.discountedPrice || item.finalPrice || item.price || 0,
  }))
}

export default function OrderDetailsModal({ open, onClose, order }) {
  if (!order) {
    return null
  }

  const {
    _id = '',
    orderId = '',
    customer = 'N/A',
    date = new Date(),
    amount = 0,
    status = 'pending',
    items = [],
    totalItems = 0,
    paymentMethod = 'N/A',
    mobile = 'N/A',
    address = {},
    shipping = { address: 'N/A', trackingNumber: 'Pending' },
    paymentProofSource = 'page',
    paymentVerification = null,
    _rawData = {},
  } = order

  const formattedItems = items.map(item => ({
    id: item._id || item.id || '',
    name: item.name || item.title || 'Untitled Product',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.image || item.img?.url || '/placeholder.png',
    size: item.size || {},
    color: item.color || {},
  }))

  const paymentProofImage = extractPaymentProofImage(order)
  const orderItems = items?.length > 0 ? items : transformCartToItems(order.cart)

  // Calculate totals with proper number handling
  const totals = {
    subtotalBeforeDiscounts:
      parseFloat(order.subtotalBeforeDiscounts) ||
      orderItems.reduce((sum, item) => {
        const price = parseFloat(item.originalPrice || 0)
        const quantity = parseInt(item.quantity || 1)
        return sum + price * quantity
      }, 0),
    totalDiscount:
      parseFloat(order.totalDiscount) ||
      orderItems.reduce((sum, item) => {
        const originalPrice = parseFloat(item.originalPrice || 0)
        const discountedPrice = parseFloat(item.discountedPrice || item.originalPrice || 0)
        const quantity = parseInt(item.quantity || 1)
        return sum + (originalPrice - discountedPrice) * quantity
      }, 0),
    totalPrice:
      parseFloat(order.totalPrice) ||
      orderItems.reduce((sum, item) => {
        const price = parseFloat(item.discountedPrice || item.originalPrice || 0)
        const quantity = parseInt(item.quantity || 1)
        return sum + price * quantity
      }, 0),
    totalItems:
      parseInt(order.totalItems) ||
      orderItems.reduce((sum, item) => sum + parseInt(item.quantity || 1), 0),
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />

        <div className="relative inline-block w-full max-w-7xl my-8 text-left align-middle transition-all transform bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)] border border-gray-100">
          {/* Luxury Header */}
          <div className="relative px-8 pt-8 pb-6 border-b border-gray-100 bg-white rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Order #{orderId}
                  </h2>
                  <p className="mt-1 text-gray-500 font-medium">{formatDate(date)}</p>
                </div>
                <StatusBadge status={status} />
              </div>

              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-500 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-8 py-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Box className="w-6 h-6 mr-3 text-indigo-600" />
                      Order Summary
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Status</span>
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Order Date</span>
                      <span className="font-semibold">{formatDate(date)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Total Items</span>
                      <span className="font-semibold">{totals.totalItems} items</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <User className="w-6 h-6 mr-3 text-blue-600" />
                      Customer Details
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                      <MapPinned className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Shipping Address</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {address?.street}, {address?.area}
                        </p>
                        <p className="text-base text-gray-600">
                          {address?.city}, {address?.province}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Banknote className="w-6 h-6 mr-3 text-emerald-600" />
                      Payment Details
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Payment Method</span>
                        </div>
                        <span className="font-semibold text-gray-900 capitalize">
                          {paymentMethod?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                        </span>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">
                            {formatPrice(totals.subtotalBeforeDiscounts)} MRU
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                          <span className="text-rose-600">Discount</span>
                          <span className="font-semibold text-rose-600">
                            -{formatPrice(totals.totalDiscount)} MRU
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                          <span className="text-white font-medium">Total Amount</span>
                          <span className="text-xl font-bold text-white">
                            {formatPrice(totals.totalPrice)} MRU
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Verification */}
                {paymentVerification && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="border-b border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-purple-600" />
                        Payment Verification
                      </h3>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <span className="text-purple-600 font-medium">Status</span>
                        <StatusBadge status={paymentVerification.status} />
                      </div>

                      {paymentProofImage ? (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                            Payment Proof
                          </h4>
                          <div className="bg-purple-50 p-4 rounded-xl">
                            <ImageViewer url={paymentProofImage} alt="Payment Proof" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-xl">
                          <p className="text-amber-800 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            No payment proof image available
                          </p>
                        </div>
                      )}

                      <div className="pt-4">
                        <PaymentVerificationControls order={order} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Order Items */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Tag className="w-6 h-6 mr-3 text-pink-600" />
                      Order Items ({totals.totalItems})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {orderItems.length > 0 ? (
                        orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="group flex items-center space-x-6 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                          >
                            <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-white p-1 shadow-sm">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-lg text-gray-900 truncate">
                                {item.name}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center text-gray-600">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Qty: {item.quantity}
                                  </span>
                                  {item.size?.size && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                      Size: {item.size.size}
                                    </span>
                                  )}
                                  {item.color?.name && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                                      Color: {item.color.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm line-through text-gray-500">
                                {formatPrice(parseFloat(item.originalPrice || 0))} MRU
                              </p>
                              <p className="text-lg font-bold text-indigo-600 mt-1">
                                {formatPrice(parseFloat(item.discountedPrice || 0))} MRU
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No items found in this order</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-amber-600" />
                      Order Timeline
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {order.tracking?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 mt-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></div>
                          </div>
                          <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">
                                {event.status.replace(/_/g, ' ').toUpperCase()}
                              </p>
                              <span className="text-sm text-gray-500">
                                {formatDate(event.date)}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-600">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Status */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
                  <div className="border-b border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Truck className="w-6 h-6 mr-3 text-indigo-600" />
                      Delivery Status
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                      <span className="text-indigo-600 font-medium">Status</span>
                      <span className="font-semibold text-gray-900">
                        {order.delivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Expected Delivery</span>
                      <span className="font-semibold text-gray-900">
                        {order.expectedDelivery
                          ? formatDate(order.expectedDelivery)
                          : 'To be determined'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
