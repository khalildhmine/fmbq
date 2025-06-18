'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import OrderDetailsModal from '@/components/admin/OrderDetailsModal'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  ChevronDown,
  MoreVertical,
} from 'lucide-react'

// Updated order statuses with their colors and styles
const statusConfig = {
  completed: {
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    icon: '✓',
  },
  delivered: {
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    icon: '📦',
  },
  shipped: {
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: '🚚',
  },
  processing: {
    color: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
    icon: '⚙️',
  },
  pending: {
    color: 'bg-orange-100 text-orange-800',
    borderColor: 'border-orange-200',
    icon: '⏱',
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-200',
    icon: '✕',
  },
}

// Status mapping for Chinese to English
const statusMapping = {
  已完成: 'completed',
  已送达: 'delivered',
  已发货: 'shipped',
  处理中: 'processing',
  待付款: 'pending',
  已取消: 'cancelled',
}

// Status flow definition
const statusFlow = {
  pending: ['processing'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

// Format price with MRU currency
const formatPrice = price => {
  if (!price || isNaN(price)) return '0.00'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(price))
}

// Calculate order total
const calculateOrderTotal = order => {
  let total = 0

  // Try to get total from order properties
  if (order.totalPrice) {
    total = parseFloat(order.totalPrice)
  } else if (order.total) {
    total = parseFloat(order.total)
  } else if (order.paymentVerification?.transactionDetails?.amount) {
    total = parseFloat(order.paymentVerification.transactionDetails.amount)
  } else {
    // Calculate from items or cart
    const items = order.items || order.cart || []
    total = items.reduce((sum, item) => {
      const price = parseFloat(item.discountedPrice || item.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + price * quantity
    }, 0)
  }

  return total
}

export default function OrdersTable({ data = [], loading = false, pageSize = 8, onStatusChange }) {
  const [orders, setOrders] = useState([])
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [expandedDropdown, setExpandedDropdown] = useState(null)

  // Initialize with default or passed data
  useEffect(() => {
    if (data.length > 0) {
      setOrders(data)
    }
  }, [data])

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (onStatusChange) {
        await onStatusChange(orderId, newStatus)
        // Update local state after successful API call
        setOrders(prevOrders =>
          prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        )
      }
      // Close dropdown after selection
      setExpandedDropdown(null)
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  // Handle order details view
  const handleViewDetails = async order => {
    // Create a full order object with items for the modal
    let fullOrder = { ...order }

    try {
      console.log('Fetching full order details for order ID:', order.id)
      const response = await fetch(`/api/orders/${order.id}?admin=true`)

      if (response.ok) {
        const result = await response.json()
        const apiOrder = result.data || result.order || result

        // If the API returned a valid order, use it
        if (apiOrder && (apiOrder.id || apiOrder._id)) {
          console.log('Successfully fetched order details')

          // Preserve the original order properties
          fullOrder = {
            ...fullOrder,
            ...apiOrder,
            // Keep existing formatted data
            customer: fullOrder.customer,
            date: fullOrder.date,
            amount: fullOrder.amount,
            orderId: fullOrder.orderId || apiOrder.orderId || apiOrder._id || fullOrder.id,
          }
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }

    // Process items and handle mock data if needed (existing code)

    setSelectedOrder(fullOrder)
    setIsDetailsModalOpen(true)
  }

  // Handle status update from modal
  const handleStatusUpdate = (orderId, newStatus) => {
    // Update local state after successful API update
    setOrders(prevOrders =>
      prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
    )
  }

  // Toggle status dropdown
  const toggleDropdown = orderId => {
    if (expandedDropdown === orderId) {
      setExpandedDropdown(null)
    } else {
      setExpandedDropdown(orderId)
    }
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesText =
        filter === '' ||
        Object.values(order).some(value =>
          String(value).toLowerCase().includes(filter.toLowerCase())
        )

      const matchesStatus = statusFilter === 'all' || statusMapping[order.status] === statusFilter

      return matchesText && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (a[sortField] < b[sortField]) comparison = -1
      if (a[sortField] > b[sortField]) comparison = 1
      return sortDirection === 'asc' ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Table Header with Search and Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h2>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-gray-50 w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <select
              className="bg-gray-50 appearance-none w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-10"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={18} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="w-10 h-10 border-t-4 border-b-4 border-black rounded-full animate-spin"></div>
                  </div>
                  <div className="mt-3 text-gray-500 font-medium">Loading orders...</div>
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <div className="font-medium">No orders found</div>
                  <div className="mt-1 text-sm">Try adjusting your search or filter</div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => {
                const mappedStatus = statusMapping[order.status] || 'pending'
                const statusStyle = statusConfig[mappedStatus] || statusConfig.pending
                const orderTotal = calculateOrderTotal(order)

                return (
                  <motion.tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-black">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(orderTotal)} MRU</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusStyle.color} border ${statusStyle.borderColor}`}
                        >
                          {statusStyle.icon} {order.status}
                        </span>

                        {/* Status Change Dropdown */}
                        {statusFlow[mappedStatus]?.length > 0 && (
                          <div className="relative ml-2">
                            <button
                              onClick={() => toggleDropdown(order.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                              <ChevronDown size={16} />
                            </button>

                            <AnimatePresence>
                              {expandedDropdown === order.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute z-10 mt-1 right-0 bg-white shadow-lg rounded-lg py-1 w-36 border border-gray-100"
                                >
                                  {statusFlow[mappedStatus].map(status => (
                                    <button
                                      key={status}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      onClick={() => handleStatusChange(order.id, status)}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}
                                      ></span>
                                      <span>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-gray-500 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <Link
                          href={`/admin/orders/${order.id}/edit`}
                          className="text-gray-500 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100"
                          title="Edit Order"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <button
              className="flex items-center text-sm text-gray-700 font-medium hover:text-black disabled:opacity-50 disabled:hover:text-gray-700"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber

                // Calculate which page numbers to show
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }

                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                        currentPage === pageNumber
                          ? 'bg-black text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                }
                return null
              })}
            </div>

            <button
              className="flex items-center text-sm text-gray-700 font-medium hover:text-black disabled:opacity-50 disabled:hover:text-gray-700"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
