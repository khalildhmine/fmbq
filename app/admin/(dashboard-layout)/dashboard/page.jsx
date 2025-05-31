'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icons from '@/components/common/Icons'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  })

  const [isLoading, setIsLoading] = useState(true)

  // Mock data loading
  useEffect(() => {
    // In production, this would be an API call
    const timer = setTimeout(() => {
      setStats({
        totalSales: 24500,
        totalOrders: 156,
        totalUsers: 98,
        totalProducts: 312,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <span className={`p-2 rounded-full ${color}`}>{icon}</span>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title === 'Total Sales' ? '$' : ''}
          {value.toLocaleString()}
        </p>
        <p className={`ml-2 text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change > 0 ? '+' : ''}
          {change}%
        </p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={<Icons.DollarSign className="w-5 h-5 text-white" />}
          color="bg-emerald-500"
          change={8.2}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<Icons.ShoppingBag className="w-5 h-5 text-white" />}
          color="bg-blue-500"
          change={5.1}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Icons.User className="w-5 h-5 text-white" />}
          color="bg-purple-500"
          change={-2.4}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Icons.Box className="w-5 h-5 text-white" />}
          color="bg-amber-500"
          change={12.3}
        />
      </div>

      {/* Recent Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    id: '#OR-12345',
                    customer: 'John Doe',
                    date: '2023-05-01',
                    status: 'Shipped',
                    total: '$249.99',
                  },
                  {
                    id: '#OR-12346',
                    customer: 'Jane Smith',
                    date: '2023-05-02',
                    status: 'Processing',
                    total: '$129.50',
                  },
                  {
                    id: '#OR-12347',
                    customer: 'Robert Brown',
                    date: '2023-05-03',
                    status: 'Delivered',
                    total: '$349.75',
                  },
                  {
                    id: '#OR-12348',
                    customer: 'Amanda Lee',
                    date: '2023-05-04',
                    status: 'Pending',
                    total: '$78.25',
                  },
                ].map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {order.date}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : order.status === 'Processing'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[
              { type: 'order', message: 'New order #OR-12349 received', time: '10 minutes ago' },
              { type: 'user', message: 'Sarah Johnson created an account', time: '2 hours ago' },
              {
                type: 'product',
                message: 'Product "Summer Dress" is low in stock',
                time: '4 hours ago',
              },
              { type: 'comment', message: 'New review on "Leather Jacket"', time: '6 hours ago' },
              { type: 'order', message: 'Order #OR-12337 was delivered', time: '8 hours ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    activity.type === 'order'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : activity.type === 'user'
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : activity.type === 'product'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                  }`}
                >
                  {activity.type === 'order' && (
                    <Icons.ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                  {activity.type === 'user' && (
                    <Icons.User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                  {activity.type === 'product' && (
                    <Icons.Box className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                  {activity.type === 'comment' && (
                    <Icons.MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
