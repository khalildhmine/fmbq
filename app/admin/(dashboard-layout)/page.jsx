'use client'

import { useEffect, useState } from 'react'
import {
  BiHomeAlt,
  BiDollarCircle,
  BiCartAlt,
  BiUserCheck,
  BiCalendarCheck,
  BiTrendingUp,
  BiSearch,
  BiFilterAlt,
  BiRefresh,
  BiPlus,
  BiPackage,
  BiCart,
  BiDollar,
  BiChevronRight,
  BiFilter,
  BiErrorCircle,
  BiCheck,
  BiTime,
  BiPackage as BiBox,
  BiCalendarX,
} from 'react-icons/bi'
import { DashboardCard, ChartCard, TableCard, SimpleCard } from '@/components/admin/DashboardCard'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Helper function to render status badges
const getStatusBadge = status => {
  const statusLower = status?.toLowerCase() || ''

  if (
    statusLower === 'completed' ||
    statusLower === 'delivered' ||
    statusLower === '已完成' ||
    statusLower === '已发货'
  ) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <BiCheck className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  } else if (statusLower === 'processing' || statusLower === '处理中') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        <BiTime className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  } else if (statusLower === 'shipped' || statusLower === '已发出') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <BiBox className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  } else if (statusLower === 'cancelled' || statusLower === '已取消') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <BiCalendarX className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  } else {
    // Default - pending or any other status
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <BiTime className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  }
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [error, setError] = useState(null)

  // Simpler fetchDashboardData without authentication logic
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching dashboard data - direct method...')

      // Make a direct fetch without any authentication headers (cookie based auth)
      const response = await fetch('/api/admin/dashboard')

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Dashboard API response:', result)

      if (result.success && result.data) {
        console.log('Setting dashboard data:', result.data)

        setStats({
          totalProducts: parseInt(result.data.totalProducts) || 0,
          totalOrders: parseInt(result.data.totalOrders) || 0,
          revenue: parseFloat(result.data.totalRevenue) || 0,
          pendingOrders: parseInt(result.data.pendingOrders) || 0,
        })

        // Set recent orders from API response
        setRecentOrders(
          result.data.recentOrders?.map(order => ({
            id: order.id,
            customer: order.customer,
            date: order.date,
            total: parseFloat(order.amount?.replace('MRU ', '')) || 0,
            status: order.status,
          })) || []
        )

        // Fetch recent products
        try {
          const productsResponse = await fetch('/api/admin/products?limit=4')
          if (productsResponse.ok) {
            const productsResult = await productsResponse.json()
            console.log('Products API response:', productsResult)

            if (productsResult.success && productsResult.data) {
              setRecentProducts(productsResult.data.products || [])
            }
          } else {
            console.error('Failed to fetch recent products:', productsResponse.statusText)
          }
        } catch (productError) {
          console.error('Error fetching products:', productError)
        }
      } else {
        throw new Error('Invalid response format from dashboard API')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message)

      // Initialize with zeros on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        pendingOrders: 0,
      })
      setRecentProducts([])
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  return (
    <div className="min-h-screen py-6 px-6 lg:px-8">
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center">
          <BiErrorCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-xs bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-200 px-3 py-1 rounded-md inline-flex items-center"
            >
              <BiRefresh className="w-3 h-3 mr-1" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back to admin dashboard
            <span className="text-green-600 dark:text-green-400 ml-1">(Authenticated)</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-black shadow-sm rounded-lg overflow-hidden flex text-sm">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-2 ${
                timeframe === 'week'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              } transition-colors`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-2 ${
                timeframe === 'month'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              } transition-colors`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-2 ${
                timeframe === 'year'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              } transition-colors`}
            >
              Year
            </button>
          </div>

          <button
            onClick={fetchDashboardData}
            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <BiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Revenue"
          value={`MRU ${stats.revenue.toLocaleString()}`}
          icon={BiDollarCircle}
          iconColor="#ffffff"
          iconBackground="rgba(0, 0, 0, 0.9)"
          loading={loading}
          footer="Total revenue from completed orders"
        />

        <DashboardCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={BiPackage}
          iconColor="#ffffff"
          iconBackground="rgba(0, 0, 0, 0.9)"
          loading={loading}
          footer="Active products in inventory"
        />

        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={BiCart}
          iconColor="#ffffff"
          iconBackground="rgba(0, 0, 0, 0.9)"
          loading={loading}
          footer="All orders placed"
        />

        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          icon={BiFilter}
          iconColor="#ffffff"
          iconBackground="rgba(0, 0, 0, 0.9)"
          loading={loading}
          footer="Orders awaiting processing"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TableCard
            title="Recent Orders"
            subtitle="Latest orders placed"
            footer={
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing recent {recentOrders.length} of {stats.totalOrders} orders
                </span>
                <Link
                  href="/admin/orders"
                  className="text-sm inline-flex items-center font-medium text-black dark:text-white hover:underline"
                >
                  View all orders
                  <BiChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            }
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-t-4 border-b-4 border-black dark:border-white rounded-full animate-spin"></div>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                  <BiCart className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No orders yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Orders will appear here when customers place them
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          #
                          {typeof order.id === 'string' && order.id.length > 8
                            ? order.id.substring(order.id.length - 8)
                            : order.id}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {order.customer || 'Guest'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          MRU {order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <span className="sr-only">View order</span>
                            <BiChevronRight className="w-5 h-5 inline-block" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableCard>
        </div>

        <div className="space-y-8">
          <ChartCard title="Revenue Trends" subtitle="Monthly revenue overview">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-10 h-10 border-t-4 border-b-4 border-black dark:border-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-4 h-56 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  <span className="block mb-2 text-3xl font-bold text-black dark:text-white">
                    +24%
                  </span>
                  Revenue growth compared to last {timeframe}
                </p>
              </div>
            )}
          </ChartCard>

          {/* Recent Products Card */}
          <ChartCard title="Recent Products" subtitle="Latest products added">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-10 h-10 border-t-4 border-b-4 border-black dark:border-white rounded-full animate-spin"></div>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mb-3">
                  <BiPackage className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No products yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentProducts.slice(0, 3).map((product, index) => (
                  <div
                    key={product.id}
                    className="py-3 px-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3">
                      {product.images && product.images.length > 0 && product.images[0].url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <BiPackage className="text-gray-400 h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          MRU {product.price.toLocaleString()}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Stock: {product.inStock}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="ml-2 text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <BiChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}

                <div className="pt-3 pb-2 px-4 text-center">
                  <Link
                    href="/admin/products"
                    className="text-sm text-black dark:text-white hover:underline inline-flex items-center"
                  >
                    View all products
                    <BiChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Upcoming Orders" subtitle="Next 7 days schedule">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-10 h-10 border-t-4 border-b-4 border-black dark:border-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {recentOrders
                  .filter(
                    order =>
                      order.status.toLowerCase() === 'pending' ||
                      order.status.toLowerCase() === 'processing'
                  )
                  .slice(0, 3)
                  .map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white flex items-center justify-center mr-4">
                        <BiCart className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Order #
                          {typeof order.id === 'string' && order.id.length > 8
                            ? order.id.substring(order.id.length - 8)
                            : order.id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'} •{' '}
                          {order.status}
                        </p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                          MRU {order.total.toLocaleString()} • {order.customer || 'Guest'}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                {recentOrders.filter(
                  order =>
                    order.status.toLowerCase() === 'pending' ||
                    order.status.toLowerCase() === 'processing'
                ).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mb-3">
                      <BiCalendarCheck className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming orders</p>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <Link
                    href="/admin/orders"
                    className="text-sm text-black dark:text-white hover:underline"
                  >
                    View all orders
                  </Link>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
