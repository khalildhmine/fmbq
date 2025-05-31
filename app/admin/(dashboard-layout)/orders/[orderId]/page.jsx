'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetSingleOrderQuery } from '@/services/api'
import { Loader2, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

// Error boundary component to catch and display rendering errors
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const errorHandler = error => {
      console.error('Order page error caught:', error)
      setError(error)
      setHasError(true)
      return true // Prevent default error handling
    }

    // Add global error handler
    window.addEventListener('error', errorHandler)

    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertCircle size={30} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          We encountered an error while displaying this order. Please try refreshing the page.
        </p>
        <div className="text-left p-4 bg-gray-100 rounded-lg mb-6 overflow-auto max-h-32">
          <pre className="text-xs text-red-600">{error?.toString() || 'Unknown error'}</pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return children
}

export default function OrderDetailPage({ params }) {
  const { orderId } = params
  const router = useRouter()
  const [fallbackOrder, setFallbackOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [attempts, setAttempts] = useState(0)

  // Primary data fetch using the API hook
  const {
    data,
    isLoading: hookLoading,
    isError: hookError,
    error: hookErrorDetails,
    refetch,
  } = useGetSingleOrderQuery(
    { id: orderId },
    {
      // Skip if no orderId - prevents unnecessary API calls
      skip: !orderId,
      // Retry several times with increasing delay
      pollingInterval: 0,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  )

  // Extract order data from response with fallbacks
  const order = data?.data || data?.order || data

  // Fallback fetch in case the main hook fails
  useEffect(() => {
    // Only try fallback if the main API call failed and we haven't exceeded retry attempts
    if (hookError && !fallbackOrder && attempts < 3) {
      const fetchOrderDirectly = async () => {
        setLoading(true)
        setFetchError(null)

        try {
          // Try alternative API endpoints
          const endpoints = [
            `/api/orders/${orderId}`,
            `/api/admin/orders/${orderId}`,
            `/api/order/${orderId}`,
          ]

          // Try each endpoint until one succeeds
          for (const endpoint of endpoints) {
            try {
              console.log(`Attempting to fetch from ${endpoint}`)
              const response = await fetch(endpoint)

              if (response.ok) {
                const result = await response.json()
                const orderData = result.data || result.order || result

                if (orderData && (orderData.orderId || orderData._id)) {
                  console.log('Fallback fetch successful:', orderData)
                  setFallbackOrder(orderData)
                  setLoading(false)
                  return
                }
              }
            } catch (endpointError) {
              console.warn(`Endpoint ${endpoint} failed:`, endpointError)
            }
          }

          // If we get here, all endpoints failed
          throw new Error('All fallback endpoints failed')
        } catch (err) {
          console.error('Fallback fetch error:', err)
          setFetchError(err.message || 'Failed to fetch order data')
          setAttempts(prev => prev + 1)
        } finally {
          setLoading(false)
        }
      }

      fetchOrderDirectly()
    }
  }, [orderId, hookError, fallbackOrder, attempts])

  // Use the best available data source
  const orderData = order || fallbackOrder

  // Handle loading states
  const isLoading = hookLoading || loading

  // Handle error states
  const isError = (hookError && !fallbackOrder) || fetchError
  const errorMessage = fetchError || hookErrorDetails?.message

  // Function to attempt data refresh
  const retryFetch = () => {
    refetch()
    setAttempts(0)
    setFetchError(null)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <div className="text-gray-700 font-medium">Loading order #{orderId}</div>
        <div className="text-gray-500 text-sm mt-1">
          Please wait while we retrieve the order details
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-500 w-6 h-6 mr-2" />
            <h2 className="text-red-700 text-lg font-semibold">Error Loading Order</h2>
          </div>
          <p className="text-red-700 mb-6">{errorMessage || 'Failed to load order details'}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={retryFetch}
              className="flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="flex items-center justify-center py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Generate a mock order if no data is available - never show a blank screen
  if (!orderData) {
    const mockOrder = generateMockOrder(orderId)
    return renderOrderDetails(mockOrder, router, true)
  }

  return renderOrderDetails(orderData, router, false)
}

// Function to render the order details
function renderOrderDetails(order, router, isMockData = false) {
  // Format the order data to ensure product details are included
  const formattedOrder = formatCartItems(order)

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          Order Details
          {isMockData && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Mock Data
            </span>
          )}
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          {isMockData && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Showing mock data because the actual order couldn't be loaded
                </span>
              </div>
              <p className="mt-1 text-sm">This is placeholder data for UI preview only.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Order ID:</p>
              <p className="font-semibold">
                {formattedOrder.orderId || formattedOrder._id || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p className="font-semibold capitalize">
                <span className={`px-2 py-1 rounded ${getStatusColor(formattedOrder.status)}`}>
                  {formattedOrder.status || 'Unknown'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Price:</p>
              <p className="font-semibold">
                {Number(formattedOrder.totalPrice || 0).toFixed(2)} MRU
              </p>
            </div>
            <div>
              <p className="text-gray-600">Items:</p>
              <p className="font-semibold">
                {formattedOrder.totalItems ||
                  (formattedOrder.cart || formattedOrder.items || []).length ||
                  0}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method:</p>
              <p className="font-semibold">{formattedOrder.paymentMethod || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date:</p>
              <p className="font-semibold">
                {formattedOrder.createdAt
                  ? new Date(formattedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            <div className="bg-gray-50 p-4 rounded">
              {formattedOrder.address ? (
                <>
                  <p>
                    {formattedOrder.address.street || 'No street'},{' '}
                    {getNestedValue(formattedOrder.address, ['area', 'name']) ||
                      getNestedValue(formattedOrder.address, ['area', 'code']) ||
                      formattedOrder.address.area ||
                      'No area'}
                  </p>
                  <p>
                    {getNestedValue(formattedOrder.address, ['city', 'name']) ||
                      getNestedValue(formattedOrder.address, ['city', 'code']) ||
                      formattedOrder.address.city ||
                      'No city'}
                    ,
                    {getNestedValue(formattedOrder.address, ['province', 'name']) ||
                      getNestedValue(formattedOrder.address, ['province', 'code']) ||
                      formattedOrder.address.province ||
                      ''}
                  </p>
                  <p>
                    Postal Code:{' '}
                    {formattedOrder.address.postalCode ||
                      formattedOrder.address.zip ||
                      'Not specified'}
                  </p>
                  <p>Mobile: {formattedOrder.mobile || 'Not provided'}</p>
                </>
              ) : (
                <p className="text-gray-500">No address information available</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium">Order Items</h2>
            </div>
            <div className="p-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-4 text-left font-medium text-gray-500 w-16">Image</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Product</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Price</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Quantity</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedOrder.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={item.image || '/placeholder.png'}
                            alt={safeDisplay(item.name)}
                            fill
                            sizes="(max-width: 768px) 100vw, 48px"
                            className="object-cover"
                            onError={e => {
                              e.target.src = '/placeholder.png'
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{safeDisplay(item.name)}</div>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                          {item.color && (
                            <span className="inline-flex items-center">
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: item.color.hashCode || '#ddd' }}
                              ></span>
                              {safeDisplay(item.color.name || 'Color')}
                            </span>
                          )}
                          {item.size && (
                            <span>Size: {safeDisplay(item.size.size || item.size)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        $
                        {typeof item.price === 'number'
                          ? item.price.toFixed(2)
                          : (item.discountedPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">{item.quantity}</td>
                      <td className="py-4 px-4 font-medium">
                        $
                        {(
                          (typeof item.price === 'number'
                            ? item.price
                            : item.discountedPrice || 0) * item.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>
                {(formattedOrder.subtotalBeforeDiscounts || formattedOrder.totalPrice || 0).toFixed(
                  2
                )}{' '}
                MRU
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount:</span>
              <span>-{Number(formattedOrder.totalDiscount || 0).toFixed(2)} MRU</span>
            </div>
            {formattedOrder.coupon && (
              <div className="flex justify-between mb-2">
                <span>Coupon ({formattedOrder.coupon.code || 'Applied'}):</span>
                <span>
                  -{Number(getNestedValue(formattedOrder, ['coupon', 'discount']) || 0).toFixed(2)}{' '}
                  MRU
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>{Number(formattedOrder.totalPrice || 0).toFixed(2)} MRU</span>
            </div>
          </div>

          {formattedOrder.tracking && formattedOrder.tracking.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h2 className="text-lg font-semibold mb-2">Order Tracking</h2>
              <div className="space-y-4">
                {formattedOrder.tracking.map((track, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1.5"></div>
                    <div className="ml-3 border-l-2 border-gray-200 pl-4 pb-6">
                      <div className="text-sm font-medium">{track.status}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(track.date).toLocaleString()}
                      </div>
                      <div className="mt-1 text-sm">{track.description}</div>
                      {track.location && (
                        <div className="text-xs text-gray-500">{track.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          {formattedOrder._id && (
            <button
              onClick={() => router.push(`/admin/orders/${formattedOrder._id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Edit Order
            </button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper to safely access nested object properties
function getNestedValue(obj, path) {
  if (!obj) return undefined
  let current = obj

  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }

  return current
}

// Function to generate mock order data for fallback
function generateMockOrder(orderId) {
  const mockItems = [
    {
      name: 'Sample Product 1',
      quantity: 2,
      price: 199.99,
      discount: 10,
      image: '/placeholder.png',
      size: { size: 'M' },
      color: { name: 'Blue' },
    },
    {
      name: 'Sample Product 2',
      quantity: 1,
      price: 149.99,
      discount: 0,
      image: '/placeholder.png',
      size: { size: 'L' },
      color: { name: 'Black' },
    },
  ]

  const subtotal = mockItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discount = mockItems.reduce(
    (acc, item) => acc + item.price * item.quantity * (item.discount / 100),
    0
  )

  return {
    _id: orderId,
    orderId: `ORD-${orderId.substring(0, 8)}`,
    status: 'processing',
    totalPrice: subtotal - discount,
    subtotalBeforeDiscounts: subtotal,
    totalDiscount: discount,
    totalItems: mockItems.reduce((acc, item) => acc + item.quantity, 0),
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date().toISOString(),
    address: {
      street: '123 Main St',
      area: 'Downtown',
      city: 'Nouakchott',
      province: 'Nouakchott',
      postalCode: '10001',
    },
    mobile: '+222XXXXXXXX',
    items: mockItems,
    tracking: [
      {
        status: 'pending',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Order received and is pending processing',
        location: 'Warehouse',
      },
      {
        status: 'processing',
        date: new Date().toISOString(),
        description: 'Order is being prepared',
        location: 'Warehouse',
      },
    ],
  }
}

// Add this function to properly format cart items to include product details
function formatCartItems(order) {
  if (!order) return null

  // Deep clone the order to avoid mutating the original
  const formattedOrder = JSON.parse(JSON.stringify(order))

  // Add items array if it doesn't exist but cart does
  if (!formattedOrder.items && formattedOrder.cart && Array.isArray(formattedOrder.cart)) {
    formattedOrder.items = formattedOrder.cart.map(item => {
      // Handle case where product details are in productID (populated field)
      if (item.productID && typeof item.productID === 'object') {
        return {
          ...item,
          name: item.productID.name || item.name,
          image: item.productID.images?.[0] || item.image,
          price: item.price || item.productID.price,
          productId: item.productID._id,
        }
      }
      return item
    })
  }

  return formattedOrder
}

// Helper function to safely stringify values for display
function safeDisplay(value) {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (err) {
      return '[Object]'
    }
  }
  return String(value)
}
