'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetSingleOrderQuery } from '@/store/services/api'
import { HandleResponse } from '@/components'

// Simple Order Form component for updating order status
const OrderForm = ({ initialValues, onSubmit, isLoading }) => {
  const [status, setStatus] = useState(initialValues?.status || 'pending')

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ status })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Order Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          disabled={isLoading}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Updating...' : 'Update Order'}
      </button>
    </form>
  )
}

export default function OrderEditPage({ params }) {
  const { orderId } = params
  const router = useRouter()

  // Use our getSingleOrderQuery hook instead
  const { data, isLoading: isFetching, error: fetchError } = useGetSingleOrderQuery({ id: orderId })

  // Manual state for order data in case the query fails
  const [order, setOrder] = useState(null)
  const [isManuallyFetching, setIsManuallyFetching] = useState(false)

  // Simple state for managing the update status
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // If the query fails, try to fetch the order manually
  useEffect(() => {
    if (data?.data) {
      setOrder(data.data)
    } else if (fetchError && !isManuallyFetching && !order) {
      // Try to fetch the order manually if the query fails
      setIsManuallyFetching(true)

      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/orders/${orderId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch order')
          }

          const result = await response.json()
          if (result.success && result.data) {
            setOrder(result.data)
          }
        } catch (err) {
          console.error('Error fetching order manually:', err)
        } finally {
          setIsManuallyFetching(false)
        }
      }

      fetchOrder()
    }
  }, [data, fetchError, orderId, isManuallyFetching, order])

  const handleSubmit = async formData => {
    try {
      setIsUpdating(true)
      setUpdateError(null)

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update order')
      }

      setUpdateSuccess(true)
      // Update local order state
      if (result.data) {
        setOrder(result.data)
      }

      setTimeout(() => {
        router.push('/admin/orders')
      }, 1500)
    } catch (err) {
      console.error('Error updating order:', err)
      setUpdateError(err.message || 'Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isFetching || isManuallyFetching) {
    return <div className="p-6">Loading order details...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Order</h1>

      {updateError && <HandleResponse isError error={updateError} />}
      {updateSuccess && <HandleResponse isSuccess message="Order updated successfully!" />}
      {fetchError && !order && !isManuallyFetching && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          Error loading order: {fetchError.message || 'Something went wrong'}
        </div>
      )}

      {order ? (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Order Information</h2>
            <p>
              <span className="font-medium">Order ID:</span> {order.orderId || order._id}
            </p>
            <p>
              <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Total:</span> ${order.totalPrice?.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Current Status:</span> {order.status}
            </p>
          </div>

          <OrderForm initialValues={order} onSubmit={handleSubmit} isLoading={isUpdating} />
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-yellow-800">Order not found</p>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
      >
        Back
      </button>
    </div>
  )
}
