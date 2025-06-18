'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useGetOrdersListQuery } from '@/store/services'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import components directly
import PageContainer from '@/components/common/PageContainer'
import { useChangeRoute, useTitle } from '@/hooks'

// Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (hasError) {
      // Log the error to an error reporting service
      console.error('Error in Orders Page')
    }
  }, [hasError])

  if (hasError) {
    return (
      <div className="p-4 text-center">
        <h2>Something went wrong.</h2>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    )
  }

  return children
}

// Dynamically import components with proper error handling
const DynamicOrdersTable = dynamic(
  () =>
    import('./OrdersTable').catch(err => {
      console.error('Failed to load OrdersTable:', err)
      return () => <div>Error loading orders table</div>
    }),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    ),
  }
)

const TableSkeleton = dynamic(
  () =>
    import('@/components/skeleton/TableSkeleton').catch(err => {
      console.error('Failed to load TableSkeleton:', err)
      return () => <div>Loading...</div>
    }),
  { ssr: false }
)

const EmptyOrdersList = dynamic(
  () =>
    import('@/components/emptyList/EmptyOrdersList').catch(err => {
      console.error('Failed to load EmptyOrdersList:', err)
      return () => <div>No orders found</div>
    }),
  { ssr: false }
)

const OrdersContent = () => {
  useTitle('Orders Management')
  const [ordersData, setOrdersData] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

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
      refetchOnFocus: false,
      refetchOnReconnect: true,
      pollingInterval: 0, // Disable polling as we'll use WebSocket
    }
  )

  // Process orders data when it arrives
  useEffect(() => {
    if (isSuccess && data?.data) {
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

        // Calculate total price from items if not available
        let totalPrice = parseFloat(order.totalPrice || 0)
        if (totalPrice === 0 && formattedItems.length > 0) {
          totalPrice = formattedItems.reduce((sum, item) => {
            const price = parseFloat(item.discountedPrice || item.price || 0)
            const quantity = parseInt(item.quantity || 1)
            return sum + price * quantity
          }, 0)
        }

        return {
          id: order._id,
          orderId: order.orderId || order._id,
          customer: order.user?.name || order.user?.email || 'Anonymous',
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : 'Invalid Date',
          amount: totalPrice, // Pass raw number to DynamicOrdersTable
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

      setOrdersData(prevOrders => {
        if (isInitialLoad || JSON.stringify(prevOrders) !== JSON.stringify(formattedOrders)) {
          return formattedOrders
        }
        return prevOrders
      })

      // Set total pages from pagination data
      if (data.data.pagination) {
        setTotalPages(data.data.pagination.totalPages || 1)
      }

      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    }
  }, [isSuccess, data, isInitialLoad])

  // Handle page change
  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      changeRoute({ page: newPage })
    }
  }

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/ws')

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === 'NEW_ORDER' || data.type === 'ORDER_UPDATE') {
        refetch() // Refetch orders when we get a WebSocket update
        if (data.type === 'NEW_ORDER') {
          toast.success('New order received!')
        }
      }
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [refetch])

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
      <div className="min-h-[400px]">
        {isFetching && !ordersData.length ? (
          <TableSkeleton />
        ) : ordersData.length > 0 ? (
          <DynamicOrdersTable
            key={`orders-table-${page}`}
            initialOrders={ordersData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : (
          <EmptyOrdersList />
        )}
      </div>
    </motion.div>
  )
}

const OrdersPage = () => {
  return (
    <ErrorBoundary>
      <PageContainer>
        <Suspense fallback={<TableSkeleton />}>
          <OrdersContent />
        </Suspense>
      </PageContainer>
    </ErrorBoundary>
  )
}

export default OrdersPage
