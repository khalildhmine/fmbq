'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  Search,
  Calendar,
  Download,
  MoreHorizontal,
  User,
  ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import OrderDetailsModal from './OrderDetailsModal'
import OrderPrintManager from './OrderPrintManager'
import { toast } from 'react-hot-toast'
import formatNumber from '@/utils/formatNumber'

// Helper function to safely stringify values
function safeDisplay(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    if (value.name) {
      return String(value.name)
    }

    if (value.size) {
      return String(value.size)
    }

    try {
      return JSON.stringify(value)
    } catch (err) {
      return '[Object]'
    }
  }

  return String(value)
}

const DynamicOrdersTable = ({ initialOrders = [], onNewOrder }) => {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [pollInterval, setPollInterval] = useState(30000)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [hasNewOrders, setHasNewOrders] = useState(false)
  const [orderFetchLoading, setOrderFetchLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [printOrder, setPrintOrder] = useState(null)

  // Status options for the dropdown
  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']

  // Payment verification statuses
  const paymentStatuses = ['pending', 'verified', 'rejected']

  // Get order status badge styling based on status
  const getStatusBadge = status => {
    const statusConfig = {
      pending: {
        icon: <Clock size={14} className="mr-1" />,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      },
      pending_verification: {
        icon: <Clock size={14} className="mr-1" />,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      },
      processing: {
        icon: <RefreshIcon className="h-3.5 w-3.5 mr-1" />,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      shipped: {
        icon: <Truck size={14} className="mr-1" />,
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      delivered: {
        icon: <CheckCircle size={14} className="mr-1" />,
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      cancelled: {
        icon: <XCircle size={14} className="mr-1" />,
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      completed: {
        icon: <CheckCircle size={14} className="mr-1" />,
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      },
      default: {
        icon: <Package size={14} className="mr-1" />,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
    }

    const config = statusConfig[status?.toLowerCase()] || statusConfig.default

    return (
      <div
        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${config.className}`}
      >
        {config.icon}
        <span className="capitalize">{status}</span>
      </div>
    )
  }

  // Fetch orders data
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders?since=${lastUpdateTime}&limit=50&admin=true`)

      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data && data.data.orders) {
        const formattedOrders = data.data.orders.map(formatOrderData)
        const newOrdersCount = data.data.orders.filter(
          order => new Date(order.createdAt) > new Date(lastUpdateTime)
        ).length

        if (newOrdersCount > 0) {
          setHasNewOrders(true)
          if (onNewOrder && typeof onNewOrder === 'function') {
            onNewOrder(newOrdersCount)
          }
        }

        setOrders(formattedOrders)
        setLastUpdateTime(Date.now())
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Format raw order data into a consistent structure
  const formatOrderData = order => {
    const itemsMap = new Map()
    let totalAmount = 0
    let totalItems = 0
    let orderItems = []

    // First try to get items from the order
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      orderItems = order.items
    } else if (order.cart && Array.isArray(order.cart) && order.cart.length > 0) {
      orderItems = order.cart
    }

    // Process items to get images and calculate totals
    orderItems = orderItems.map(item => {
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

      // Calculate item total
      const quantity = parseInt(item.quantity || 1)
      const price = parseFloat(item.discountedPrice || item.price || 0)
      totalAmount += price * quantity
      totalItems += quantity

      return {
        ...item,
        image: imageUrl || '/placeholder.svg',
        quantity: quantity,
        price: price,
      }
    })

    // Calculate total amount properly - try multiple sources
    let amount = 0

    // First try to get the amount from order totals
    if (order.totalPrice && !isNaN(parseFloat(order.totalPrice))) {
      amount = parseFloat(order.totalPrice)
    } else if (order.total && !isNaN(parseFloat(order.total))) {
      amount = parseFloat(order.total)
    } else if (order.amount && !isNaN(parseFloat(order.amount))) {
      amount = parseFloat(order.amount)
    } else if (
      order.paymentVerification?.transactionDetails?.amount &&
      !isNaN(parseFloat(order.paymentVerification.transactionDetails.amount))
    ) {
      amount = parseFloat(order.paymentVerification.transactionDetails.amount)
    } else if (orderItems.length > 0) {
      // Calculate from items if no total is available
      amount = orderItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.discountedPrice || item.price || 0)
        const itemQuantity = parseInt(item.quantity || 1)
        return sum + itemPrice * itemQuantity
      }, 0)
    }

    // If we still have no amount, try to calculate from raw cart data
    if (amount === 0 && order.cart && Array.isArray(order.cart)) {
      amount = order.cart.reduce((sum, item) => {
        const itemPrice = parseFloat(item.discountedPrice || item.price || 0)
        const itemQuantity = parseInt(item.quantity || 1)
        return sum + itemPrice * itemQuantity
      }, 0)
    }

    // Format the date consistently
    const orderDate = new Date(order.createdAt)
    const formattedDate = orderDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    return {
      id: order.id || order._id,
      orderId: order.orderId || order.id || order._id,
      customer: order.customer || order.user?.name || order.user?.email || 'Anonymous',
      date: formattedDate,
      amount: amount,
      status: order.status || 'processing',
      items: orderItems.length > 0 ? orderItems : null,
      cart: orderItems.length > 0 ? null : order.cart,
      totalItems: order.totalItems || totalItems || order.cart?.length || 0,
      paymentMethod: order.paymentMethod || 'N/A',
      mobile: order.mobile || 'N/A',
      address: order.address || order.shippingAddress || {},
      shipping: order.shipping || {
        address:
          order.address || order.shippingAddress
            ? `${(order.address || order.shippingAddress).street || ''}, ${(order.address || order.shippingAddress).city || ''}`
            : 'N/A',
        trackingNumber: order.trackingNumber || 'Pending',
      },
      createdAt: order.createdAt,
      isNew: new Date(order.createdAt) > new Date(lastUpdateTime - 60000),
      paymentVerification: order.paymentVerification || null,
      paymentStatus: order.paymentStatus || order.paymentVerification?.status || 'pending',
      user: order.user || null,
      subtotalBeforeDiscounts: order.subtotalBeforeDiscounts || 0,
      totalDiscount: order.totalDiscount || 0,
      totalPrice: order.totalPrice || amount,
      _rawData: order,
    }
  }

  // Poll for new orders
  useEffect(() => {
    fetchOrders()

    const intervalId = setInterval(() => {
      fetchOrders(false)
    }, pollInterval)

    return () => clearInterval(intervalId)
  }, [pollInterval])

  // Update orders when initialOrders changes
  useEffect(() => {
    console.log('Initial orders received:', initialOrders)
    setOrders(initialOrders)
  }, [initialOrders])

  // Handle refresh button click
  const handleRefresh = () => {
    setHasNewOrders(false)
    fetchOrders(true)
  }

  // Handle view order details - FIXED VERSION
  const handleViewDetails = useCallback(async order => {
    console.log('Opening order details for:', order.orderId)
    setOrderFetchLoading(true)

    try {
      const response = await fetch(`/api/orders/${order.id || order._id}?admin=true`)

      if (response.ok) {
        const result = await response.json()
        const fullOrderData = result.data || result.order || result

        if (fullOrderData) {
          // Create a complete order object with all necessary data
          const enhancedOrder = {
            ...fullOrderData,
            id: fullOrderData.id || fullOrderData._id,
            orderId: fullOrderData.orderId || order.orderId,
            customer:
              fullOrderData.customer || fullOrderData.user?.name || order.customer || 'Anonymous',
            date: order.date,
            amount: fullOrderData.totalPrice || fullOrderData.amount || order.amount,
            status: fullOrderData.status || order.status,
            items: fullOrderData.items || fullOrderData.cart || order.items || [],
            cart: fullOrderData.cart || order.cart || [],
            paymentMethod: fullOrderData.paymentMethod || order.paymentMethod,
            mobile: fullOrderData.mobile || order.mobile,
            address: fullOrderData.address || fullOrderData.shippingAddress || order.address,
            shippingAddress:
              fullOrderData.shippingAddress || fullOrderData.address || order.address,
            paymentVerification: fullOrderData.paymentVerification || order.paymentVerification,
            paymentStatus:
              fullOrderData.paymentStatus ||
              fullOrderData.paymentVerification?.status ||
              order.paymentStatus ||
              'pending',
            user: fullOrderData.user || order.user,
            subtotalBeforeDiscounts:
              fullOrderData.subtotalBeforeDiscounts || order.subtotalBeforeDiscounts || 0,
            totalDiscount: fullOrderData.totalDiscount || order.totalDiscount || 0,
            totalPrice: fullOrderData.totalPrice || fullOrderData.amount || order.amount,
            createdAt: fullOrderData.createdAt || order.createdAt,
          }

          console.log('Enhanced order data:', enhancedOrder)
          setSelectedOrder(enhancedOrder)
          setIsDetailsModalOpen(true)
          setOrderFetchLoading(false)
          return
        }
      }

      // Fallback to using the order from table
      console.log('Using fallback order data:', order)
      setSelectedOrder(order)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      setSelectedOrder(order)
      setIsDetailsModalOpen(true)
    } finally {
      setOrderFetchLoading(false)
    }
  }, [])

  // Handle print order - completely separate state management
  const handlePrintOrder = useCallback(order => {
    console.log('Opening print for order:', order.orderId)
    const printOrder = { ...order }
    setPrintOrder(printOrder)
    setIsPrintModalOpen(true)
  }, [])

  // Handle status update from modal
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
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
        prevOrders.map(order => (order._id === orderId ? { ...order, status: newStatus } : order))
      )

      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update order status')
    }
  }

  // Handle payment verification from modal
  const handlePaymentVerification = async (orderId, status) => {
    try {
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
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                paymentVerification: {
                  ...order.paymentVerification,
                  status,
                },
                status: status === 'verified' ? 'processing' : order.status,
              }
            : order
        )
      )

      toast.success('Payment verification updated successfully')
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Failed to verify payment')
    }
  }

  // Handle modal close - FIXED VERSION
  const handleDetailsModalClose = useCallback(() => {
    console.log('Closing details modal')
    setIsDetailsModalOpen(false)
    // Don't immediately clear selectedOrder to prevent flash
    setTimeout(() => {
      setSelectedOrder(null)
    }, 300)
  }, [])

  const handlePrintModalClose = useCallback(() => {
    console.log('Closing print modal')
    setIsPrintModalOpen(false)
    setTimeout(() => {
      setPrintOrder(null)
    }, 300)
  }, [])

  // Filter orders by search term
  const filteredOrders = searchTerm
    ? orders.filter(
        order =>
          order.orderId.toString().includes(searchTerm) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders

  return (
    <div className="bg-slate-950 rounded-xl shadow-xl border border-slate-800/50 backdrop-blur-md">
      {/* Header with controls */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-violet-400" />
            <Typography variant="h6" className="text-white font-medium m-0">
              Orders
            </Typography>
            <div className="bg-violet-500/10 text-violet-400 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
              {orders.length}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full pl-10 p-2.5"
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                color: 'rgb(139, 92, 246)',
                '&:hover': {
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                },
                textTransform: 'none',
                borderRadius: '0.5rem',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
          <p className="text-slate-400 text-sm mb-4">
            Orders will appear here when customers place them.
          </p>
          <Button
            onClick={handleRefresh}
            variant="outlined"
            sx={{
              color: 'rgb(139, 92, 246)',
              borderColor: 'rgba(139, 92, 246, 0.5)',
              '&:hover': {
                borderColor: 'rgb(139, 92, 246)',
                bgcolor: 'rgba(139, 92, 246, 0.1)',
              },
              textTransform: 'none',
              borderRadius: '0.5rem',
            }}
          >
            Check for new orders
          </Button>
        </div>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
          <Table
            sx={{
              '& .MuiTableCell-root': {
                borderColor: 'rgba(30, 41, 59, 0.5)',
                color: '#e2e8f0',
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)' }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    position: 'relative',
                    ...(order.isNew && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        backgroundColor: 'rgb(139, 92, 246)',
                      },
                    }),
                  }}
                >
                  <TableCell component="th" scope="row">
                    {order.orderId}
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(order.amount) || 0)}{' '}
                    MRU
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center gap-2">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsModalOpen(true)
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <select
                        className="px-2 py-1 border rounded text-sm"
                        value={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        className="px-2 py-1 border rounded text-sm"
                        value={order.paymentVerification?.status || 'pending'}
                        onChange={e => handlePaymentVerification(order._id, e.target.value)}
                      >
                        {paymentStatuses.map(status => (
                          <option key={status} value={status}>
                            Payment: {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <Tooltip title="Print Order">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setPrintOrder(order)
                            setIsPrintModalOpen(true)
                          }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order print modal */}
      <OrderPrintManager
        open={isPrintModalOpen}
        onClose={handlePrintModalClose}
        order={printOrder}
      />

      {/* Order details modal */}
      <OrderDetailsModal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}

export default DynamicOrdersTable
