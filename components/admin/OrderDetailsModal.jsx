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

export default function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
  if (!order) return null

  const [loadedImages, setLoadedImages] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState(order.status || '')
  const [showPaymentProof, setShowPaymentProof] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (order && order.status) {
      setNewStatus(order.status)
    }
  }, [order])

  useEffect(() => {
    const handleShowPaymentProof = () => {
      setShowPaymentProof(true)
    }

    window.addEventListener('showPaymentProof', handleShowPaymentProof)
    return () => {
      window.removeEventListener('showPaymentProof', handleShowPaymentProof)
    }
  }, [])

  // Handle modal close properly
  const handleClose = () => {
    setIsOpen(false)
    if (onClose) {
      setTimeout(() => {
        onClose()
      }, 100)
    }
  }

  const handleImageLoad = itemId => {
    setLoadedImages(prev => ({
      ...prev,
      [itemId]: true,
    }))
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'

    try {
      if (typeof dateString === 'object' && dateString.$date) {
        dateString = dateString.$date
      }

      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order.status) return

    setIsUpdating(true)

    try {
      const orderIdToUse = order._id || order.id || order.orderId
      const response = await fetch(`/api/orders/${orderIdToUse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Order status updated to ${newStatus}`)

        if (onStatusUpdate) {
          onStatusUpdate(orderIdToUse, newStatus)
        }
      } else {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error.message || 'Failed to update order status')
      setNewStatus(order.status)
    } finally {
      setIsUpdating(false)
    }
  }

  const paymentVerification = order.paymentVerification || {}
  const paymentProofImage = extractPaymentProofImage(order)
  const transactionAmount = paymentVerification.transactionDetails?.amount || null
  const transactionDate = paymentVerification.transactionDetails?.date || null
  const verificationStatus = paymentVerification.verificationStatus || null

  // Custom styled components
  const SectionTitle = ({ children }) => (
    <Typography
      sx={{
        fontSize: '1.25rem',
        fontWeight: 800,
        color: '#000',
        mb: 3,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        position: 'relative',
        paddingBottom: '12px',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '40px',
          height: '4px',
          backgroundColor: '#000',
        },
      }}
    >
      {children}
    </Typography>
  )

  const StyledPaper = ({ children, highlighted = false, ...props }) => (
    <Paper
      {...props}
      sx={{
        p: 3,
        borderRadius: 0,
        boxShadow: highlighted ? '0 5px 25px rgba(0, 0, 0, 0.15)' : 'none',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
        backgroundColor: highlighted ? '#f9f9f9' : '#fff',
        ...props.sx,
      }}
    >
      {children}
    </Paper>
  )

  const TabButton = ({ active, label, icon, onClick }) => (
    <Button
      startIcon={icon}
      onClick={onClick}
      sx={{
        color: active ? '#fff' : '#000',
        backgroundColor: active ? '#000' : 'transparent',
        border: active ? 'none' : '1px solid #000',
        borderRadius: 0,
        padding: '10px 16px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: active ? '#000' : '#f5f5f5',
          color: active ? '#fff' : '#000',
        },
        mr: 1,
        mb: { xs: 1, md: 0 },
      }}
    >
      {label}
    </Button>
  )

  const renderPaymentVerification = () => {
    let paymentProofSource = 'none'
    let paymentData = order?.paymentVerification || order?._rawData?.paymentVerification || {}
    let verificationStatus = null
    let transactionDetails = {}
    let imageUrl = null

    if (typeof paymentData.verificationStatus === 'string') {
      verificationStatus = paymentData.verificationStatus
    } else if (paymentData.status) {
      verificationStatus = paymentData.status
    }

    if (paymentData.transactionDetails) {
      transactionDetails = paymentData.transactionDetails

      if (
        transactionDetails.date &&
        typeof transactionDetails.date === 'object' &&
        transactionDetails.date.$date
      ) {
        transactionDetails.date = transactionDetails.date.$date
      }
    }

    imageUrl = extractPaymentProofImage(order)

    if (typeof paymentData.paymentProofSource === 'string') {
      paymentProofSource = paymentData.paymentProofSource
    } else if (typeof paymentData.source === 'string') {
      paymentProofSource = paymentData.source
    }

    return (
      <StyledPaper highlighted>
        <Grid container spacing={4}>
          <Grid item xs={12} md={imageUrl ? 6 : 12}>
            <Box>
              {verificationStatus && (
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 1, fontWeight: 500 }}>
                    VERIFICATION STATUS
                  </Typography>
                  <PaymentVerificationBadge status={verificationStatus} />
                </Box>
              )}

              {order.paymentMethod === 'BANK_TRANSFER' && (
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 2, fontWeight: 500 }}>
                    QUICK ACTIONS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      onClick={() => {
                        setNewStatus('processing')
                        setTimeout(handleUpdateStatus, 100)
                      }}
                      disabled={isUpdating || order.status === 'processing'}
                      startIcon={<CheckCircle sx={{ width: 16, height: 16 }} />}
                      sx={{
                        backgroundColor: '#000',
                        color: '#fff',
                        borderRadius: 0,
                        py: 1.5,
                        px: 3,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        '&:hover': {
                          backgroundColor: '#333',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#ccc',
                          color: '#666',
                        },
                      }}
                    >
                      Approve Payment & Process
                    </Button>

                    <Button
                      onClick={() => {
                        setNewStatus('cancelled')
                        setTimeout(handleUpdateStatus, 100)
                      }}
                      disabled={isUpdating || order.status === 'cancelled'}
                      startIcon={<XCircle sx={{ width: 16, height: 16 }} />}
                      sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        border: '1px solid #000',
                        borderRadius: 0,
                        py: 1.5,
                        px: 3,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#f9f9f9',
                          color: '#999',
                          borderColor: '#ddd',
                        },
                      }}
                    >
                      Reject Payment & Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              <Grid container spacing={3}>
                {transactionDetails?.amount && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography
                        sx={{ fontSize: '0.875rem', color: '#666', mb: 1, fontWeight: 500 }}
                      >
                        TRANSACTION AMOUNT
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#000' }}>
                        {transactionDetails.amount} MRU
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {transactionDetails?.date && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography
                        sx={{ fontSize: '0.875rem', color: '#666', mb: 1, fontWeight: 500 }}
                      >
                        TRANSACTION DATE
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar sx={{ width: 16, height: 16, mr: 1, color: '#666' }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#000' }}>
                          {formatDate(transactionDetails.date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {imageUrl && (
            <Grid item xs={12} md={6}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', color: '#666', mb: 2, fontWeight: 500 }}>
                  PAYMENT PROOF IMAGE
                </Typography>
                <Box
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid #000',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover .image-overlay': {
                      opacity: 1,
                    },
                  }}
                  onClick={() => setShowPaymentProof(true)}
                  id="payment-proof-image-container"
                >
                  <Box
                    className="image-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 10,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        px: 3,
                        py: 1.5,
                        borderRadius: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Eye sx={{ width: 18, height: 18, mr: 1, color: '#fff' }} />
                      <Typography
                        sx={{
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        View Full Image
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Payment proof"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 300,
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5',
                      display: 'block',
                    }}
                    onClick={e => {
                      e.stopPropagation()
                      setShowPaymentProof(true)
                    }}
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = '/placeholder.png'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    onClick={() => setShowPaymentProof(true)}
                    startIcon={<Eye sx={{ width: 14, height: 14 }} />}
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      fontSize: '0.7rem',
                      py: 1,
                      px: 2,
                      borderRadius: 0,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '1px',
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}
                  >
                    View Full Size
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </StyledPaper>
    )
  }

  const renderSummaryTab = () => (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <StyledPaper>
            <SectionTitle>Order Summary</SectionTitle>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#666',
                      mb: 1,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Customer Name
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#000' }}>
                    {order.customer}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#666',
                      mb: 1,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Order Date
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#000' }}>
                    {new Date(order.date || order.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#666',
                      mb: 1,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Total Amount
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#000' }}>
                    ${order.amount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#666',
                      mb: 1,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Payment Method
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#000' }}>
                    {order.paymentMethod || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>

          <Box sx={{ mt: 5 }}>
            <SectionTitle>Order Items</SectionTitle>
            {order.items && order.items.length > 0 ? (
              <Box>
                {order.items.map((item, index) => (
                  <StyledPaper
                    key={index}
                    sx={{
                      mb: 2,
                      borderLeft: '4px solid #000',
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Typography
                          sx={{ fontSize: '1rem', fontWeight: 700, color: '#000', mb: 1 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>
                          Quantity: {item.quantity || 1}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#000' }}>
                          ${item.price}
                        </Typography>
                        {item.originalPrice && (
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              color: '#999',
                              textDecoration: 'line-through',
                              fontWeight: 500,
                            }}
                          >
                            ${item.originalPrice}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </StyledPaper>
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: '#666', fontStyle: 'italic' }}>
                No items information available
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} lg={4}>
          <StyledPaper highlighted sx={{ borderTop: '5px solid #000' }}>
            <SectionTitle>Order Status</SectionTitle>
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#666',
                  mb: 1,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Current Status
              </Typography>
              <StatusBadge status={order.status} />
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#666',
                  mb: 2,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Update Status
              </Typography>

              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
                <InputLabel
                  id="status-select-label"
                  sx={{
                    color: '#666',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#000',
                    },
                  }}
                >
                  Select Status
                </InputLabel>
                <Select
                  labelId="status-select-label"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  label="Select Status"
                  disabled={isUpdating}
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                      borderWidth: '1px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                      borderWidth: '2px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                      borderWidth: '2px',
                    },
                    color: '#000',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={isUpdating ? <CircularProgress size={18} /> : <SaveIcon />}
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === order.status}
                fullWidth
                sx={{
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: 0,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  },
                }}
              >
                UPDATE STATUS
              </Button>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <SectionTitle>Payment Verification</SectionTitle>
        {renderPaymentVerification()}
      </Box>
    </>
  )

  const renderPaymentTab = () => (
    <Box>
      <SectionTitle>Payment Details</SectionTitle>
      {renderPaymentVerification()}
    </Box>
  )

  const renderItemsTab = () => (
    <Box>
      <SectionTitle>Order Items</SectionTitle>
      {order.items && order.items.length > 0 ? (
        <Grid container spacing={2}>
          {order.items.map((item, index) => (
            <Grid item xs={12} key={index}>
              <StyledPaper
                sx={{
                  borderLeft: '4px solid #000',
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography
                      sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#000', mb: 1 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>
                      Quantity: {item.quantity || 1}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#000' }}>
                      ${item.price}
                    </Typography>
                    {item.originalPrice && (
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: '#999',
                          textDecoration: 'line-through',
                          fontWeight: 500,
                        }}
                      >
                        ${item.originalPrice}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No items information available
        </Typography>
      )}
    </Box>
  )

  const renderPaymentProofModal = () => {
    if (!showPaymentProof) return null

    const imageUrl = extractPaymentProofImage(order)
    if (!imageUrl) return null

    return (
      <Dialog
        open={showPaymentProof}
        onClose={() => setShowPaymentProof(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Payment Proof Image
            </Typography>
            <IconButton onClick={() => setShowPaymentProof(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={imageUrl}
            alt="Payment proof"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
            onError={e => {
              e.target.onerror = null
              e.target.src = '/placeholder.png'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button
            onClick={() => setShowPaymentProof(false)}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 0,
              py: 1,
              px: 3,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '1px',
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            minHeight: '85vh',
            maxHeight: '90vh',
            margin: { xs: 1, sm: 2 },
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            borderBottom: '2px solid #000',
            backgroundColor: '#000',
            color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: '1px',
                fontSize: '1.5rem',
                textTransform: 'uppercase',
              }}
            >
              Order #{order.orderId || order.id || 'Unknown'}
            </Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              p: 2,
              px: 3,
            }}
          >
            <TabButton
              active={activeTab === 'summary'}
              label="Summary"
              icon={<Package sx={{ width: 16, height: 16 }} />}
              onClick={() => setActiveTab('summary')}
            />
            <TabButton
              active={activeTab === 'items'}
              label="Items"
              icon={<DollarSign sx={{ width: 16, height: 16 }} />}
              onClick={() => setActiveTab('items')}
            />
            <TabButton
              active={activeTab === 'payment'}
              label="Payment"
              icon={<CreditCard sx={{ width: 16, height: 16 }} />}
              onClick={() => setActiveTab('payment')}
            />
          </Box>
        </Box>

        <DialogContent sx={{ p: 4, backgroundColor: '#fff' }}>
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'items' && renderItemsTab()}
          {activeTab === 'payment' && renderPaymentTab()}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f9f9f9',
            justifyContent: 'space-between',
          }}
        >
          <Button
            startIcon={<BugReportIcon />}
            onClick={() => setShowDebug(!showDebug)}
            sx={{
              color: '#666',
              borderRadius: 0,
              border: '1px solid #ccc',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '1px',
              py: 1,
              px: 2,
              '&:hover': {
                backgroundColor: '#f0f0f0',
                borderColor: '#999',
              },
            }}
          >
            {showDebug ? 'Hide Debug' : 'Debug'}
          </Button>

          <Box>
            <Button
              component={Link}
              href={`/admin/orders/${order.id || order._id}`}
              startIcon={<Edit sx={{ width: 16, height: 16 }} />}
              sx={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #000',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                py: 1,
                px: 3,
                mr: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Edit Order
            </Button>
            <Button
              onClick={handleClose}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 0,
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '1px',
                py: 1.5,
                px: 4,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {renderPaymentProofModal()}

      {showDebug && (
        <Dialog
          open={showDebug}
          onClose={() => setShowDebug(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <DialogTitle
            sx={{
              p: 2,
              backgroundColor: '#000',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Debug Information
            </Typography>
            <IconButton onClick={() => setShowDebug(false)} size="small" sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box
              component="pre"
              sx={{
                p: 3,
                m: 0,
                overflow: 'auto',
                backgroundColor: '#f5f5f5',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                maxHeight: '500px',
              }}
            >
              {JSON.stringify(order, null, 2)}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
            <Button
              onClick={() => setShowDebug(false)}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 0,
                py: 1,
                px: 3,
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '1px',
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = status => {
    switch (status) {
      case 'pending':
        return { color: '#fff', bgColor: '#ff9800', borderColor: '#e67e00' }
      case 'processing':
        return { color: '#fff', bgColor: '#2196f3', borderColor: '#0b7dda' }
      case 'shipped':
        return { color: '#fff', bgColor: '#9c27b0', borderColor: '#7b1fa2' }
      case 'delivered':
        return { color: '#fff', bgColor: '#4caf50', borderColor: '#3d8b40' }
      case 'completed':
        return { color: '#fff', bgColor: '#4caf50', borderColor: '#3d8b40' }
      case 'cancelled':
        return { color: '#fff', bgColor: '#f44336', borderColor: '#d32f2f' }
      default:
        return { color: '#fff', bgColor: '#9e9e9e', borderColor: '#757575' }
    }
  }

  const styleObj = getStatusStyles(status)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        backgroundColor: styleObj.bgColor,
        color: styleObj.color,
        border: `1px solid ${styleObj.borderColor}`,
        borderRadius: 0,
        px: 2,
        py: 0.75,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {status && status.charAt(0).toUpperCase() + status.slice(1)}
    </Box>
  )
}

// Payment Verification Badge Component
const PaymentVerificationBadge = ({ status }) => {
  const getStylesForStatus = status => {
    switch (status) {
      case 'verified':
        return {
          color: '#1b5e20',
          bgColor: '#e8f5e9',
          borderColor: '#c8e6c9',
          icon: <CheckCircle sx={{ width: 16, height: 16, mr: 1, color: '#1b5e20' }} />,
        }
      case 'pending':
        return {
          color: '#e65100',
          bgColor: '#fff3e0',
          borderColor: '#ffe0b2',
          icon: <Clock sx={{ width: 16, height: 16, mr: 1, color: '#e65100' }} />,
        }
      case 'rejected':
      case 'failed':
        return {
          color: '#b71c1c',
          bgColor: '#ffebee',
          borderColor: '#ffcdd2',
          icon: <XCircle sx={{ width: 16, height: 16, mr: 1, color: '#b71c1c' }} />,
        }
      default:
        return {
          color: '#455a64',
          bgColor: '#eceff1',
          borderColor: '#cfd8dc',
          icon: <Clock sx={{ width: 16, height: 16, mr: 1, color: '#455a64' }} />,
        }
    }
  }

  const styleObj = getStylesForStatus(status)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: styleObj.bgColor,
        color: styleObj.color,
        border: `1px solid ${styleObj.borderColor}`,
        borderRadius: 0,
        px: 2,
        py: 1,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {styleObj.icon}
      {status && status.charAt(0).toUpperCase() + status.slice(1)}
    </Box>
  )
}
