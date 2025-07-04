'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Eye, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import modals
const OrderDetailsModal = dynamic(() => import('@/components/admin/OrderDetailsModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

const PrintOrderModal = dynamic(() => import('@/components/admin/PrintOrderModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

function OrdersTable({ initialOrders = [], currentPage = 1, totalPages = 1, onPageChange }) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const handleViewDetails = async order => {
    // Set loading state immediately
    setSelectedOrder({ ...order, isLoading: true })
    setIsDetailsModalOpen(true)

    let orderData = { ...order }

    try {
      // Get the order ID, ensuring we have a valid value
      const orderId = order._id || order.id
      if (!orderId) {
        throw new Error('Order ID is missing')
      }

      console.log('Fetching order details for ID:', orderId) // Debug log

      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received order data:', data) // Debug log

      if (data.success && data.order) {
        // Ensure all required fields have default values
        orderData = {
          _id: data.order._id || orderId,
          orderId: data.order.orderId || orderId,
          customer: data.order.user?.name || data.order.user?.email || 'Anonymous',
          date: data.order.createdAt || new Date().toISOString(),
          amount: parseFloat(data.order.totalPrice || 0),
          status: data.order.status || 'pending',
          items: (data.order.items || []).map(item => ({
            _id: item._id || '',
            name: item.name || item.title || 'Untitled Product',
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            image: item.image || item.img?.url || '/placeholder.png',
            size: item.size || {},
            color: item.color || {},
          })),
          totalItems: data.order.totalItems || 0,
          paymentMethod: data.order.paymentMethod || 'N/A',
          mobile: data.order.mobile || 'N/A',
          address: data.order.address || {},
          shipping: {
            address: data.order.address
              ? `${data.order.address.street || ''}, ${data.order.address.city?.name || ''}`
              : 'N/A',
            trackingNumber: data.order.trackingNumber || 'Pending',
          },
          paymentProofSource: data.order.paymentProofSource || 'page',
          paymentVerification: data.order.paymentVerification || null,
          _rawData: data.order,
        }
      } else {
        throw new Error(data.message || 'Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error(error.message || 'Failed to fetch order details')
      setSelectedOrder(null)
      setIsDetailsModalOpen(false)
      return
    }

    // Update the selected order with the final data and remove loading state
    setSelectedOrder({ ...orderData, isLoading: false })
  }

  const handlePrint = order => {
    setSelectedOrder(order)
    setIsPrintModalOpen(true)
  }

  const handleOrderUpdate = updatedOrder => {
    setOrders(prevOrders => {
      const orderIndex = prevOrders.findIndex(order => order._id === updatedOrder._id)
      if (orderIndex === -1) {
        return [updatedOrder, ...prevOrders]
      } else {
        const newOrders = [...prevOrders]
        newOrders[orderIndex] = updatedOrder
        return newOrders
      }
    })

    if (selectedOrder?._id === updatedOrder._id) {
      setSelectedOrder(updatedOrder)
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
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
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
                        onClick={() => handlePrint(order)}
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
      <OrderDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
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
