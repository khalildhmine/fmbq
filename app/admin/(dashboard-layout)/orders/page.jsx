'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useGetOrdersListQuery } from '@/store/services'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

import { ShowWrapper, PageContainer } from '@/components'
import { useChangeRoute } from 'hooks'
import { useTitle } from '@/hooks'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Dynamically import components that use client-side features
const DynamicOrdersTable = dynamic(() => import('@/components/admin/DynamicOrdersTable.jsx'))
const TableSkeleton = dynamic(() => import('@/components/skeleton/TableSkeleton.jsx'))
const EmptyOrdersList = dynamic(() => import('@/components/emptyList/EmptyOrdersList.jsx'))

const OrdersContent = () => {
  useTitle('Orders Management')
  const [ordersData, setOrdersData] = useState([])
  const [retryCount, setRetryCount] = useState(0)

  //? Assets
  const searchParams = useSearchParams()
  const page = searchParams?.get('page') ? +searchParams.get('page') : 1
  const changeRoute = useChangeRoute()

  //? Get Orders Query
  const { data, isSuccess, isFetching, error, isError, refetch } = useGetOrdersListQuery(
    {
      page,
      pageSize: 10,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 0,
    }
  )

  // Process orders data when it arrives
  useEffect(() => {
    if (isSuccess && data?.data?.orders) {
      console.log('Raw orders data:', data.data.orders)
      const formattedOrders = data.data.orders.map(order => {
        // Extract cart/items information
        const items = order.items || order.cart || []
        const formattedItems = items.map(item => {
          let imageUrl = null
          if (item.image) {
            imageUrl = item.image
          } else if (item.img?.url) {
            imageUrl = item.img.url
          } else if (item.productID?.image) {
            imageUrl = item.productID.image
          } else if (item.productID?.images?.[0]) {
            imageUrl = item.productID.images[0].url || item.productID.images[0]
          }

          return {
            ...item,
            image: imageUrl || '/placeholder.png',
          }
        })

        return {
          id: order._id,
          orderId: order.orderId || order._id,
          customer: order.user?.name || order.user?.email || 'Anonymous',
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Invalid Date',
          amount: `${order.totalPrice || 0} MRU`,
          status: order.status || 'processing',
          items: formattedItems,
          totalItems: order.totalItems || formattedItems.length || 0,
          paymentMethod: order.paymentMethod || 'N/A',
          mobile: order.mobile || 'N/A',
          address: order.address || {},
          shipping: {
            address: order.address
              ? `${order.address.street || ''}, ${order.address.city?.name || ''}`
              : 'N/A',
            trackingNumber: order.trackingNumber || 'Pending',
          },
          paymentProofSource: order.paymentProofSource || 'page',
          paymentVerification: order.paymentVerification || null,
          _rawData: order,
        }
      })

      console.log('Formatted orders:', formattedOrders)
      setOrdersData(formattedOrders)
    }
  }, [isSuccess, data])

  // Handle notification when a new order is received
  const handleNewOrder = count => {
    toast.success(`${count} new order${count > 1 ? 's' : ''} received!`)
  }

  // Fallback fetch if needed
  useEffect(() => {
    const fetchOrdersDirectly = async () => {
      if (isError && retryCount < 3) {
        try {
          const response = await fetch(`/api/orders?page=${page}&page_size=10&admin=true`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data?.orders) {
              setOrdersData(result.data.orders)
            }
          }
        } catch (err) {
          console.error('Error in fallback fetch:', err)
          setRetryCount(prev => prev + 1)
        }
      }
    }

    fetchOrdersDirectly()
  }, [isError, retryCount, page])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Orders Management
        </h1>
        <p className="text-gray-400 mt-1">View and manage all customer orders</p>
      </div>

      {/* Show error with retry button */}
      {isError && (
        <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-400 h-6 w-6" />
            <h3 className="text-lg font-medium text-red-400">Error Loading Orders</h3>
          </div>
          <p className="text-gray-400 mb-4">
            {error?.data?.message || error?.message || 'Failed to load orders data'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      <Suspense fallback={<div>Loading...</div>}>
        {isFetching ? (
          <TableSkeleton />
        ) : ordersData.length > 0 ? (
          <DynamicOrdersTable initialOrders={ordersData} onNewOrder={handleNewOrder} />
        ) : (
          <EmptyOrdersList />
        )}
      </Suspense>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
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
      </div>
    </motion.div>
  )
}

const OrdersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  )
}

export default OrdersPage
