'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Eye, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import modals
const NewOrderDetailsModal = dynamic(() => import('@/components/admin/NewOrderDetailsModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

const PrintOrderModal = dynamic(() => import('@/components/admin/PrintOrderModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

// Status options for the dropdown
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']

// Payment verification statuses
const paymentStatuses = ['pending', 'verified', 'rejected']

function OrdersTable({ initialOrders = [], currentPage = 1, totalPages = 1, onPageChange }) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Keep orders in sync with initialOrders prop
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleViewDetails = async order => {
    try {
      // Get the order ID, ensuring we have a valid value
      const orderId = order?._id || order?.id
      if (!orderId) {
        toast.error('Invalid order data')
        return
      }

      // Set initial order data immediately
      setSelectedOrder(order)
      setIsDetailsModalOpen(true)

      // Fetch complete order details
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()

      // Handle both flat and nested response structures
      const orderData = data.order || data

      // Process and set the complete order data
      const processedOrder = {
        ...orderData,
        _id: orderData._id || orderId,
        orderId: orderData.orderId || orderId,
        items: orderData.items || orderData.cart || [],
        status: orderData.status || 'pending',
        amount: parseFloat(orderData.amount || orderData.totalPrice || 0),
        totalPrice: parseFloat(orderData.totalPrice || orderData.amount || 0),
        createdAt: orderData.createdAt || orderData.date || new Date().toISOString(),
        customer:
          orderData.user?.name || orderData.user?.email || orderData.customer || 'Anonymous',
        paymentVerification: orderData.paymentVerification || {},
        address: orderData.address || orderData.shippingAddress || null,
        user: orderData.user || {},
        mobile: orderData.mobile || '',
        paymentMethod: orderData.paymentMethod || 'N/A',
        paymentStatus:
          orderData.paymentStatus || orderData.paymentVerification?.status || 'pending',
        subtotalBeforeDiscounts: orderData.subtotalBeforeDiscounts || 0,
        totalDiscount: orderData.totalDiscount || 0,
        // Keep the original nested structure for compatibility
        order: orderData,
      }

      // Update both selected order and orders list
      setSelectedOrder(processedOrder)
      setOrders(prevOrders =>
        prevOrders.map(o => (o._id === orderId ? { ...o, ...processedOrder } : o))
      )
    } catch (error) {
      console.error('Error handling view details:', error)
      toast.error('Failed to load complete order details')
    }
  }
  const handlePrintOrder = async order => {
    try {
      const orderId = order._id || order.id
      if (!orderId) {
        toast.error('Invalid order data')
        return
      }

      // Fetch complete order details if needed
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedOrder(data) // This will include the nested structure
      } else {
        setSelectedOrder(order) // Use the existing order data
      }

      setIsPrintModalOpen(true)
    } catch (error) {
      console.error('Error preparing order for print:', error)
      setSelectedOrder(order) // Fallback to existing order data
      setIsPrintModalOpen(true)
    }
  }

  const handleOrderUpdate = updatedOrder => {
    try {
      setOrders(prevOrders => {
        const orderIndex = prevOrders.findIndex(order => order._id === updatedOrder._id)
        if (orderIndex === -1) {
          return [updatedOrder, ...prevOrders]
        } else {
          const newOrders = [...prevOrders]
          newOrders[orderIndex] = { ...newOrders[orderIndex], ...updatedOrder }
          return newOrders
        }
      })

      if (selectedOrder?._id === updatedOrder._id) {
        setSelectedOrder(prev => ({ ...prev, ...updatedOrder }))
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  // Handle status update
  const handleStatusUpdate = async (order, newStatus) => {
    try {
      // Get the correct order ID, trying multiple possible properties
      const orderId = order._id || order.id || order.orderId

      if (!orderId) {
        toast.error('Invalid order ID')
        return
      }

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const data = await response.json()

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o._id === orderId || o.id === orderId ? { ...o, status: newStatus } : o
        )
      )

      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update order status')
    }
  }

  // Handle payment verification
  const handlePaymentVerification = async (order, status) => {
    try {
      // Get the correct order ID, trying multiple possible properties
      const orderId = order._id || order.id || order.orderId

      if (!orderId) {
        toast.error('Invalid order ID')
        return
      }

      const response = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify payment')
      }

      const data = await response.json()

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o._id === orderId || o.id === orderId
            ? {
                ...o,
                paymentVerification: {
                  ...o.paymentVerification,
                  status,
                },
                status: status === 'verified' ? 'processing' : o.status,
              }
            : o
        )
      )

      toast.success('Payment verification updated successfully')
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Failed to verify payment')
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id || order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId || order._id || order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer ||
                      (order.user && (order.user.name || order.user.email)) ||
                      'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt || order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof order.amount === 'number' ? order.amount.toFixed(2) : '0.00'} MRU
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.paymentVerification?.status || 'pending'}
                      onChange={e => handlePaymentVerification(order, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {paymentStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50"
                        title="Print Order"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <NewOrderDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleOrderUpdate}
      />

      {/* Print Order Modal */}
      <PrintOrderModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        order={selectedOrder}
      />
    </>
  )
}

export default OrdersTable
