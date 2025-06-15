'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Edit,
  Save,
  Eye,
} from 'lucide-react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material'

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

// Status options for dropdown
const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']

// Status badge configurations
const statusConfig = {
  pending: {
    color: 'warning',
    label: 'Pending',
  },
  processing: {
    color: 'info',
    label: 'Processing',
  },
  shipped: {
    color: 'primary',
    label: 'Shipped',
  },
  delivered: {
    color: 'success',
    label: 'Delivered',
  },
  completed: {
    color: 'success',
    label: 'Completed',
  },
  cancelled: {
    color: 'error',
    label: 'Cancelled',
  },
}

// Payment verification badge configurations
const paymentVerificationConfig = {
  verified: {
    color: 'success',
    label: 'Verified',
    icon: <CheckCircle className="w-4 h-4 mr-1" />,
  },
  pending: {
    color: 'warning',
    label: 'Pending',
    icon: <Clock className="w-4 h-4 mr-1" />,
  },
  rejected: {
    color: 'error',
    label: 'Rejected',
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
  failed: {
    color: 'error',
    label: 'Failed',
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
}

// const PaymentVerificationBadge = ({ status }) => {
//   const config = paymentVerificationConfig[status] || paymentVerificationConfig.pending
//   return (
//     <div
//       className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
//     >
//       {config.icon}
//       {config.label}
//     </div>
//   )
// }

// const StatusBadge = ({ status }) => {
//   const config = statusConfig[status] || statusConfig.pending
//   return (
//     <Chip
//       label={config.label}
//       color={config.color}
//       size="small"
//       sx={{ textTransform: 'capitalize' }}
//     />
//   )
// }

// Helper function to extract payment proof image URL from any order data structure
function extractPaymentProofImage(order) {
  if (!order) return null

  // Direct check for the standard path
  if (order.paymentVerification?.image?.url) {
    return order.paymentVerification.image.url
  }

  // If we have _rawData, check there
  if (order._rawData?.paymentVerification?.image?.url) {
    return order._rawData.paymentVerification.image.url
  }

  // Special handling for MongoDB format with $oid fields
  if (order._id && typeof order._id === 'object') {
    const orderStr = JSON.stringify(order)
    const imageUrlMatch = orderStr.match(/"url"\s*:\s*"(https?:\/\/[^"]+)"/)
    if (imageUrlMatch && imageUrlMatch[1]) {
      return imageUrlMatch[1]
    }
  }

  // Handle payment verification as a string
  if (typeof order.paymentVerification === 'string') {
    try {
      const parsedVerification = JSON.parse(order.paymentVerification)
      if (parsedVerification.image && parsedVerification.image.url) {
        return parsedVerification.image.url
      }
    } catch (e) {
      console.error('Error parsing paymentVerification string:', e)
    }
  }

  // Last resort: Look for Cloudinary URLs in the entire object
  const str = JSON.stringify(order)
  const matches = str.match(/https?:\/\/res\.cloudinary\.com\/[^"]+/g)
  if (matches && matches.length > 0) {
    return matches[0]
  }

  return null
}

const OrderDetailsModal = ({ open, onClose, order }) => {
  const [activeTab, setActiveTab] = useState('summary')
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatus, setEditedStatus] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPaymentProof, setShowPaymentProof] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (order) {
      setEditedStatus(order.status || 'pending')
    }
  }, [order])

  const handleClose = () => {
    setActiveTab('summary')
    setIsEditing(false)
    setError(null)
    onClose()
  }

  const handleUpdateStatus = async () => {
    if (!order || !editedStatus) return

    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: editedStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const result = await response.json()
      if (result.success) {
        toast.success('Order status updated successfully')
        setIsEditing(false)
        // Trigger a refresh of the orders list
        if (typeof onClose === 'function') {
          onClose('refresh')
        }
      } else {
        throw new Error(result.message || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err.message)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!order) return null

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Order Info */}
      <Paper className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" component="h3">
            Order Information
          </Typography>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsEditing(true)}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Order ID
                </Typography>
                <Typography>{order.orderId}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Date
                </Typography>
                <Typography>{order.date}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editedStatus}
                      onChange={e => setEditedStatus(e.target.value)}
                      disabled={isUpdating}
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="capitalize">{status}</span>
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                )}
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Customer
                </Typography>
                <Typography>{order.customer}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Phone
                </Typography>
                <Typography>{order.mobile || 'N/A'}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">
                  Payment Method
                </Typography>
                <Typography className="capitalize">{order.paymentMethod}</Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* Items */}
      <Paper className="p-4">
        <Typography variant="h6" component="h3" className="mb-4">
          Order Items
        </Typography>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded">
              {item.image && (
                <div className="w-16 h-16 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <Typography variant="subtitle1">{item.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Price: {item.price} MRU
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Paper>

      {/* Payment Info */}
      <Paper className="p-4">
        <Typography variant="h6" component="h3" className="mb-4">
          Payment Information
        </Typography>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Typography>Subtotal</Typography>
            <Typography>{order.amount}</Typography>
          </div>
          <div className="flex justify-between">
            <Typography>Shipping</Typography>
            <Typography>Free</Typography>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between font-bold">
            <Typography variant="subtitle1">Total</Typography>
            <Typography variant="subtitle1">{order.amount}</Typography>
          </div>
        </div>
      </Paper>

      {/* Shipping Address */}
      <Paper className="p-4">
        <Typography variant="h6" component="h3" className="mb-4">
          Shipping Address
        </Typography>
        <Typography>{order.shipping?.address || 'No shipping address provided'}</Typography>
      </Paper>
    </div>
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle>
        <div className="flex items-center justify-between">
          <Typography variant="h6">Order Details</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        {renderSummaryTab()}
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get status icon
const getStatusIcon = status => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'processing':
      return <RefreshCw className="w-4 h-4" />
    case 'shipped':
      return <Truck size={14} className="mr-1" />
    case 'delivered':
    case 'completed':
      return <CheckCircle size={14} className="mr-1" />
    case 'cancelled':
      return <XCircle size={14} className="mr-1" />
    default:
      return <Package size={14} className="mr-1" />
  }
}

// Status badge component
const getStatusBadge = status => {
  const statusConfig = {
    pending: {
      icon: <Clock size={14} className="mr-1" />,
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    processing: {
      icon: <RefreshCw className="h-3.5 w-3.5 mr-1" />,
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

export default OrderDetailsModal
