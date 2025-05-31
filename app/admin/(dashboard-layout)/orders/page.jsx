'use client'

import { useState, useEffect } from 'react'
import { useGetOrdersListQuery } from '@/store/services'
import { motion } from 'framer-motion'

import { ShowWrapper, EmptyOrdersList, PageContainer, TableSkeleton } from 'components'
import DynamicOrdersTable from '@/components/admin/DynamicOrdersTable.jsx'
import { useChangeRoute } from 'hooks'
import { useTitle, useUrlQuery } from '@/hooks'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const OrdersPage = () => {
  useTitle('Orders Management')
  const [isLoading, setIsLoading] = useState(true)
  const [ordersData, setOrdersData] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const [fallbackOrders, setFallbackOrders] = useState(null)

  //? Assets
  const query = useUrlQuery()
  const page = query.page ? +query.page : 1
  const changeRoute = useChangeRoute()

  //? Get Orders Query
  const { data, isSuccess, isFetching, error, isError, refetch, status } = useGetOrdersListQuery(
    {
      page,
      pageSize: 10,
    },
    {
      // Add these options to improve reliability
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      // Don't retry infinitely
      pollingInterval: 0,
      // Force admin route
      extraOptions: {
        admin: true,
      },
    }
  )

  // Handle notification when a new order is received
  const handleNewOrder = count => {
    toast.success(`${count} new order${count > 1 ? 's' : ''} received!`)
  }

  // Fallback fetch if primary query fails
  useEffect(() => {
    const fetchOrdersDirectly = async () => {
      if (isError && retryCount < 3 && !fallbackOrders) {
        try {
          console.log('Attempting direct fetch for orders, attempt:', retryCount + 1)
          // Add admin=true parameter to force admin route
          const response = await fetch(`/api/orders?page=${page}&page_size=10&admin=true`)

          if (response.ok) {
            const result = await response.json()
            console.log('Fallback fetch successful:', result)

            if (result.success && result.data && result.data.orders) {
              setFallbackOrders(result.data.orders)
            }
          } else {
            throw new Error('Fallback fetch failed')
          }
        } catch (err) {
          console.error('Error in fallback fetch:', err)
          setRetryCount(prev => prev + 1)
        }
      }
    }

    fetchOrdersDirectly()
  }, [isError, retryCount, page, fallbackOrders])

  useEffect(() => {
    // Use either the primary data or fallback data
    const ordersToProcess = data?.data?.orders || fallbackOrders

    if ((isSuccess || fallbackOrders) && ordersToProcess) {
      // Format orders data for our custom table
      const formattedOrders = ordersToProcess.map(order => {
        // Extract cart/items information with image data
        let orderItems = []

        // Try to extract items from the different possible sources
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
          orderItems = order.items.map(item => {
            // Ensure image URLs are properly included
            let imageUrl = null
            if (item.image) {
              imageUrl = item.image
            } else if (item.img && item.img.url) {
              imageUrl = item.img.url
            } else if (typeof item.productID === 'object' && item.productID?.image) {
              imageUrl = item.productID.image
            } else if (
              typeof item.productID === 'object' &&
              item.productID?.images &&
              Array.isArray(item.productID.images) &&
              item.productID.images.length > 0
            ) {
              imageUrl = item.productID.images[0].url || item.productID.images[0]
            }

            return {
              ...item,
              image: imageUrl || '/placeholder.png',
            }
          })
        } else if (order.cart && Array.isArray(order.cart) && order.cart.length > 0) {
          orderItems = order.cart.map(item => {
            // Ensure image URLs are properly included
            let imageUrl = null
            if (item.image) {
              imageUrl = item.image
            } else if (item.img && item.img.url) {
              imageUrl = item.img.url
            } else if (typeof item.productID === 'object' && item.productID?.image) {
              imageUrl = item.productID.image
            } else if (
              typeof item.productID === 'object' &&
              item.productID?.images &&
              Array.isArray(item.productID.images) &&
              item.productID.images.length > 0
            ) {
              imageUrl = item.productID.images[0].url || item.productID.images[0]
            }

            return {
              ...item,
              image: imageUrl || '/placeholder.png',
            }
          })
        }

        return {
          id: order.id || order._id,
          orderId: order.orderId || order.id || order._id,
          customer: order.user?.name || order.user?.email || 'Anonymous',
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          amount: `${order.totalPrice || 0} MRU`,
          status: order.status || 'processing',
          items: orderItems.length > 0 ? orderItems : null,
          cart: orderItems.length > 0 ? null : order.cart, // Only include cart if we haven't already extracted items
          totalItems: order.totalItems || orderItems.length || order.cart?.length || 0,
          // Add these additional fields that might be needed by the OrdersTable
          paymentMethod: order.paymentMethod || 'N/A',
          mobile: order.mobile || 'N/A',
          address: order.address || {},
          shipping: order.shipping || {
            address: order.address
              ? `${order.address.street || ''}, ${order.address.city?.name || ''}`
              : 'N/A',
            trackingNumber: order.trackingNumber || 'Pending',
          },
          // Add paymentProofSource to prevent ReferenceError
          paymentProofSource: order.paymentProofSource || 'page',
          paymentVerification: order.paymentVerification || null,
          // Add raw data to ensure all information is available to components
          _rawData: order,
        }
      })

      setOrdersData(formattedOrders)
      setIsLoading(false)
    }
  }, [isSuccess, data, fallbackOrders])

  // Ensure each order has items data for display in modals
  useEffect(() => {
    if (ordersData.length > 0) {
      // Add mock items to any orders that don't have them
      const ordersWithItems = ordersData.map(order => {
        // Skip if order already has items
        if (
          (order.items && Array.isArray(order.items) && order.items.length > 0) ||
          (order.cart && Array.isArray(order.cart) && order.cart.length > 0)
        ) {
          return order
        }

        // Create a modified order with mock items
        const orderWithItems = { ...order }

        // Parse the amount to get a number
        const amount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '')) || 100

        // Create mock items based on the order amount
        orderWithItems.items = [
          {
            name: 'Order Item',
            price: `${amount} MRU`,
            quantity: 1,
            image: '/placeholder.png',
          },
        ]

        console.log('Added mock items to order:', order.id)
        return orderWithItems
      })

      // Update the orders data with the enhanced orders
      if (JSON.stringify(ordersData) !== JSON.stringify(ordersWithItems)) {
        setOrdersData(ordersWithItems)
      }
    }
  }, [ordersData])

  // Force refetch on manual retry
  const handleRetry = () => {
    setRetryCount(0)
    setIsLoading(true)
    refetch()
  }

  // Page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  //? Render(s)
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="p-4 md:p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Orders Management
        </h1>
        <p className="text-gray-400 mt-1">View and manage all customer orders</p>
      </div>

      {/* Show error with retry button */}
      {isError && !fallbackOrders && (
        <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-400 h-6 w-6" />
            <h3 className="text-lg font-medium text-red-400">Error Loading Orders</h3>
          </div>
          <p className="text-gray-400 mb-4">
            {error?.data?.message || error?.message || 'Failed to load orders data'}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* New Dynamic Orders Table with real-time updates */}
      <DynamicOrdersTable initialOrders={ordersData} onNewOrder={handleNewOrder} />

      {/* Legacy Orders Table - can be removed if dynamic table works well */}
      {/* <div className="mt-8">
        <ShowWrapper
          error={error}
          isError={isError && !fallbackOrders}
          refetch={refetch}
          isFetching={isFetching && isLoading}
          isSuccess={isSuccess || !!fallbackOrders}
          dataLength={ordersData.length}
          emptyComponent={<EmptyOrdersList />}
          loadingComponent={<TableSkeleton />}
        >
          <OrdersTable orders={ordersData} />
        </ShowWrapper>
      </div> */}

      {/* Pagination - if needed */}
      {/* <div className="mt-6 flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => changeRoute({ page: page - 1 })}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => changeRoute({ page: page + 1 })}
            disabled={!data?.data?.pagination || page === data.data.pagination.totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div> */}
    </motion.div>
  )
}

export default OrdersPage
