'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Collapse,
  Tabs,
  Tab,
  useTheme,
  alpha,
  styled,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Print,
  Save,
  ExpandMore,
  ExpandLess,
  ColorLens,
  Image,
  QrCode,
  Description,
  Settings,
  LocalShipping,
  Security,
  WaterDrop,
} from '@mui/icons-material'
import { useReactToPrint } from 'react-to-print'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Styled components for better performance and cleaner code
const PrintManagerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  gap: theme.spacing(2),
}))

const SettingsPanel = styled(Paper)(({ theme }) => ({
  width: '320px',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '3px',
  },
}))

const PreviewPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  backgroundColor: 'white',
  overflow: 'auto',
  position: 'relative',
  boxShadow: '0 0 10px rgba(0,0,0,0.05)',
  '@media print': {
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
    height: 'auto',
  },
  '& .print-table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(3),
  },
  '& .print-table th': {
    textAlign: 'left',
    padding: theme.spacing(1),
    borderBottom: '2px solid',
    fontWeight: 600,
  },
  '& .print-table td': {
    padding: theme.spacing(1),
    borderBottom: '1px solid #ddd',
  },
  '& .print-table tfoot td': {
    fontWeight: 600,
  },
  '& .printing-watermark': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '40px',
    opacity: 0.1,
    pointerEvents: 'none',
    zIndex: 1000,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  '@page': {
    size: 'auto',
    margin: 0,
  },
}))

const SettingGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}))

const SettingGroupHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  cursor: 'pointer',
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
  },
}))

const SliderLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(0.5),
}))

// Pre-defined settings presets
const PRESETS = {
  standard: {
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeLogo: true,
    showImages: true,
    includeBarcode: true,
    includeQR: true,
    fontFamily: 'Arial',
    fontSize: 12,
    primaryColor: '#000000',
    secondaryColor: '#666666',
  },
  compact: {
    paperSize: 'A5',
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    includeLogo: true,
    showImages: false,
    includeBarcode: true,
    includeQR: false,
    fontFamily: 'Arial',
    fontSize: 10,
    primaryColor: '#000000',
    secondaryColor: '#666666',
  },
  invoice: {
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeLogo: true,
    showImages: false,
    includeBarcode: true,
    includeQR: false,
    fontFamily: 'Times New Roman',
    fontSize: 12,
    primaryColor: '#333333',
    secondaryColor: '#666666',
  },
  shipping: {
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    includeLogo: true,
    showImages: false,
    includeBarcode: true,
    includeQR: true,
    fontFamily: 'Arial',
    fontSize: 12,
    primaryColor: '#000000',
    secondaryColor: '#666666',
  },
}

// Separate print content component - IMPROVED FOR EXACT PRINT MATCHING
const PrintContent = React.forwardRef(({ order, printSettings }, ref) => {
  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">No order data available</Typography>
      </Box>
    )
  }

  // Common styles that will be used in both preview and print
  const headerStyle = {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const sectionStyle = {
    marginBottom: '24px',
    padding: '16px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  }

  const headingStyle = {
    marginBottom: '8px',
    color: printSettings.primaryColor,
    fontWeight: 600,
    fontFamily: printSettings.fontFamily,
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
  }

  const thStyle = {
    textAlign: 'left',
    padding: '8px',
    borderBottom: `2px solid ${printSettings.primaryColor}`,
    fontWeight: 600,
    color: printSettings.primaryColor,
  }

  const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #ddd',
  }

  const tdRightStyle = {
    ...tdStyle,
    textAlign: 'right',
  }

  const footerTotalStyle = {
    textAlign: 'right',
    padding: '12px',
    fontWeight: 'bold',
    borderTop: `2px solid ${printSettings.primaryColor}`,
  }

  const barcodeContainerStyle = {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  }

  const barcodeItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }

  const watermarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '40px',
    color: printSettings.primaryColor,
    opacity: printSettings.watermarkOpacity,
    pointerEvents: 'none',
    zIndex: 1000,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
  }

  return (
    <Box
      ref={ref}
      sx={{
        padding: '20px',
        backgroundColor: 'white',
        color: printSettings.primaryColor,
        fontFamily: printSettings.fontFamily,
        fontSize: printSettings.fontSize,
        position: 'relative',
        '@media print': {
          padding: 0,
          width: '100%',
          height: 'auto',
        },
      }}
    >
      {/* Header */}
      <Box style={headerStyle}>
        {printSettings.includeLogo && (
          <Box
            sx={{
              maxWidth:
                printSettings.logoSize === 'large'
                  ? '200px'
                  : printSettings.logoSize === 'medium'
                    ? '150px'
                    : '100px',
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '100%' }}
              onError={() => console.warn('Logo image failed to load')}
            />
          </Box>
        )}
        <Box sx={{ textAlign: printSettings.includeLogo ? 'right' : 'left' }}>
          <Typography
            variant="h4"
            sx={{
              color: printSettings.primaryColor,
              fontFamily: printSettings.fontFamily,
              fontWeight: 600,
              fontSize: printSettings.fontSize * 2,
              margin: 0,
            }}
          >
            Order #{order.orderId}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: printSettings.secondaryColor, margin: 0 }}>
            Date: {new Date(order.date || new Date()).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Customer Information */}
      <Box style={sectionStyle}>
        <Typography variant="h6" style={headingStyle}>
          Customer Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ mb: 1 }}>
              <strong style={{ color: printSettings.primaryColor }}>Name:</strong>{' '}
              {order?.customer?.name || order?.user?.name || order?.customer || 'Not Provided'}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong style={{ color: printSettings.primaryColor }}>Phone:</strong>{' '}
              {(() => {
                // Format phone numbers consistently
                const phone = order?.mobile || order?.customer?.phone || order?.phone
                if (!phone) return 'Not Provided'

                // Basic phone formatting - adjust based on requirements
                let formattedPhone = phone.toString().trim()
                if (formattedPhone.startsWith('+')) {
                  // International format - keep as is
                  return formattedPhone
                } else if (formattedPhone.length === 10) {
                  // US format without country code
                  return `+1 ${formattedPhone.substring(0, 3)}-${formattedPhone.substring(
                    3,
                    6
                  )}-${formattedPhone.substring(6)}`
                } else {
                  // Unknown format - just ensure + prefix if not present
                  return formattedPhone.startsWith('+') ? formattedPhone : `+${formattedPhone}`
                }
              })()}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong style={{ color: printSettings.primaryColor }}>Email:</strong>{' '}
              {order?.email || order?.customer?.email || order?.user?.email || 'Not Provided'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ mb: 1 }}>
              <strong style={{ color: printSettings.primaryColor }}>Shipping Address:</strong>
            </Typography>
            {(() => {
              // Systematically extract and format the shipping address
              const shippingAddress = order?.shipping?.address || ''
              const addressParts = []

              // Try multiple possible address sources
              if (order?.shippingAddress) {
                // If we have a structured address object
                if (order.shippingAddress.street) addressParts.push(order.shippingAddress.street)
                if (order.shippingAddress.area) addressParts.push(order.shippingAddress.area)
                if (order.shippingAddress.city) addressParts.push(order.shippingAddress.city)
                if (order.shippingAddress.province)
                  addressParts.push(order.shippingAddress.province)
                if (order.shippingAddress.postalCode)
                  addressParts.push(order.shippingAddress.postalCode)
                if (order.shippingAddress.country) addressParts.push(order.shippingAddress.country)
              } else if (shippingAddress) {
                // If we have a string address
                addressParts.push(shippingAddress)
              }

              if (addressParts.length === 0) {
                return <Typography color="text.secondary">Not Provided</Typography>
              }

              // Return each part of the address on its own line
              return addressParts.map((part, index) => (
                <Typography key={index} sx={{ ml: 2 }}>
                  {part}
                </Typography>
              ))
            })()}
          </Grid>
        </Grid>
      </Box>

      {/* Order Items */}
      <Box style={{ marginBottom: '24px' }}>
        <Typography variant="h6" style={headingStyle}>
          Order Items
        </Typography>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '50%' }}>Item</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Quantity</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(order?.cart || order?.items || []).map((item, idx) => {
              const quantity = Number(item?.quantity) || 1
              const price = Number(item?.price) || 0
              const originalPrice = Number(item?.originalPrice) || price
              const discount = Number(item?.discount) || 0
              const itemTotal = price * quantity

              return (
                <tr key={item.id || idx}>
                  <td style={tdStyle}>
                    {printSettings.showImages && item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width:
                            printSettings.imageSize === 'large'
                              ? '80px'
                              : printSettings.imageSize === 'medium'
                                ? '60px'
                                : '40px',
                          marginRight: '8px',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {item.name}
                  </td>
                  <td style={tdRightStyle}>{quantity}</td>
                  <td style={tdRightStyle}>${originalPrice.toFixed(2)}</td>
                  <td style={tdRightStyle}>${itemTotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ ...tdRightStyle, fontWeight: 'bold' }}>
                Subtotal:
              </td>
              <td style={{ ...tdRightStyle, fontWeight: 'bold' }}>
                $
                {(() => {
                  const items = order?.cart || order?.items || []
                  const subtotal = items.reduce((sum, item) => {
                    const quantity = Number(item?.quantity) || 1
                    const price = Number(item?.price) || 0
                    return sum + price * quantity
                  }, 0)
                  return subtotal.toFixed(2)
                })()}
              </td>
            </tr>
            <tr>
              <td colSpan="3" style={{ ...tdRightStyle, fontWeight: 'bold' }}>
                Shipping:
              </td>
              <td style={{ ...tdRightStyle, fontWeight: 'bold' }}>
                ${order?.shipping?.cost?.toFixed(2) || '0.00'}
              </td>
            </tr>
            <tr>
              <td colSpan="3" style={footerTotalStyle}>
                Total:
              </td>
              <td style={footerTotalStyle}>
                $
                {(() => {
                  const items = order?.cart || order?.items || []
                  const subtotal = items.reduce((sum, item) => {
                    const quantity = Number(item?.quantity) || 1
                    const price = Number(item?.price) || 0
                    return sum + price * quantity
                  }, 0)

                  const totalDiscount = Number(order?.totalDiscount) || 0
                  const couponDiscount = Number(order?.coupon?.discount) || 0
                  const shippingCost = Number(order?.shipping?.cost) || 0
                  const total = subtotal - totalDiscount - couponDiscount + shippingCost

                  return total.toFixed(2)
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </Box>

      {/* Barcode and QR Code */}
      {(printSettings.includeBarcode || printSettings.includeQR) && (
        <Box style={barcodeContainerStyle}>
          {printSettings.includeBarcode && (
            <Box style={barcodeItemStyle}>
              <img
                src={`https://barcode.tec-it.com/barcode.ashx?data=${
                  order?.orderId || '12345'
                }&code=${printSettings.barcodeType}&dpi=96`}
                alt="Barcode"
                style={{ maxWidth: '150px', height: 'auto' }}
              />
              <Typography
                variant="caption"
                sx={{
                  marginTop: '4px',
                  color: printSettings.secondaryColor,
                }}
              >
                Order #{order?.orderId || '12345'}
              </Typography>
            </Box>
          )}
          {printSettings.includeQR && (
            <Box style={barcodeItemStyle}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
                  order?.orderId || '12345'
                }`}
                alt="QR Code"
                style={{ maxWidth: '150px', height: 'auto' }}
              />
              <Typography
                variant="caption"
                sx={{
                  marginTop: '4px',
                  color: printSettings.secondaryColor,
                }}
              >
                Scan to track
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Notes */}
      {printSettings.includeNotes && printSettings.notes && (
        <Box style={sectionStyle}>
          <Typography variant="h6" style={headingStyle}>
            Notes
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{printSettings.notes}</Typography>
        </Box>
      )}

      {/* Watermark */}
      {printSettings.includeWatermark && (
        <div style={watermarkStyle}>{printSettings.watermarkText}</div>
      )}

      {/* Footer */}
      {printSettings.pageNumbers && (
        <Box
          sx={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px solid #eee',
            textAlign: printSettings.pageNumberPosition.includes('center')
              ? 'center'
              : printSettings.pageNumberPosition.includes('right')
                ? 'right'
                : 'left',
            fontSize: '0.75rem',
            color: printSettings.secondaryColor,
          }}
        >
          Page 1
        </Box>
      )}
    </Box>
  )
})

PrintContent.displayName = 'PrintContent'

const OrderPrintManager = ({ open, onClose, order }) => {
  const theme = useTheme()
  const printRef = useRef(null)
  const [activeTab, setActiveTab] = useState(0)
  const [expandedGroups, setExpandedGroups] = useState({
    document: true,
    content: true,
    branding: true,
    security: false,
    advanced: false,
  })
  const [printError, setPrintError] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch order data if not provided
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!order && open) {
        try {
          setIsLoading(true)
          const response = await fetch('/api/orders', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`)
          }

          const data = await response.json()
          if (data.orders && data.orders.length > 0) {
            // Use the first order if no specific order is selected
            order = data.orders[0]
          } else {
            setPrintError('No orders found.')
          }
        } catch (error) {
          console.error('Error fetching order data:', error)
          setPrintError('Failed to load order data. Please check your connection or try again.')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchOrderData()
  }, [open])

  // Check content readiness
  useEffect(() => {
    if (open && order && printRef.current) {
      setIsContentReady(true)
      setPrintError(null)
    } else {
      setIsContentReady(false)
      if (open && !order) {
        setPrintError('No order data available.')
      }
    }
  }, [open, order])

  // Default print settings
  const [printSettings, setPrintSettings] = useState({
    // Document Settings
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    quality: 'high',
    preset: 'standard',

    // Content Settings
    includeLogo: true,
    logoSize: 'medium',
    logoPosition: 'header',
    includeBarcode: true,
    barcodeType: 'code128',
    includeQR: true,
    includeWatermark: false,
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 0.1,
    showImages: true,
    imageSize: 'medium',

    // Branding Settings
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontFamily: 'Arial',
    fontSize: 12,
    lineHeight: 1.5,
    headerStyle: 'modern',
    footerStyle: 'minimal',

    // Security Settings
    includeSecurityFeatures: false,
    securityLevel: 'basic',
    includeDigitalSignature: false,
    includeTimestamp: true,

    // Additional Elements
    includeTerms: true,
    includeShippingInfo: true,
    includePaymentInfo: true,
    includeNotes: true,
    notes: '',

    // Advanced Settings
    resolution: 300,
    colorMode: 'color',
    pageNumbers: true,
    pageNumberPosition: 'bottom-center',
  })

  // Update the useReactToPrint hook implementation
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true)
      setPrintError(null)
      return new Promise(resolve => {
        setTimeout(resolve, 500) // Give time for styles to apply
      })
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    },
    onPrintError: error => {
      console.error('Print error:', error)
      setPrintError(`Failed to print: ${error.message || 'Unknown error'}`)
      setIsPrinting(false)
    },
    pageStyle: `
      @page {
        size: ${printSettings.paperSize} ${printSettings.orientation};
        margin: ${printSettings.margins.top}mm ${printSettings.margins.right}mm ${printSettings.margins.bottom}mm ${printSettings.margins.left}mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `,
    removeAfterPrint: true,
  })

  // Toggle setting groups
  const toggleGroup = useCallback(group => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }))
  }, [])

  // Handle setting changes
  const handleSettingChange = useCallback((setting, value) => {
    setPrintSettings(prev => ({
      ...prev,
      [setting]: value,
    }))
  }, [])

  // Handle nested setting changes (for margins, etc.)
  const handleNestedSettingChange = useCallback((parent, setting, value) => {
    const numericValue = Number(value)
    // Prevent negative or invalid margin values
    if (numericValue < 0) return
    setPrintSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [setting]: numericValue,
      },
    }))
  }, [])

  // Apply preset settings
  const applyPreset = useCallback(presetName => {
    if (PRESETS[presetName]) {
      setPrintSettings(prev => ({
        ...prev,
        ...PRESETS[presetName],
        preset: presetName,
      }))
    }
  }, [])

  // Save current settings as a custom preset
  const saveCustomPreset = useCallback(() => {
    // Implementation would save to localStorage or backend
    alert('Settings saved as custom preset!')
  }, [])

  // Render tab panels for settings
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Document
        return (
          <>
            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preset Templates
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Preset</InputLabel>
                <Select
                  value={printSettings.preset}
                  onChange={e => {
                    applyPreset(e.target.value)
                  }}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="invoice">Invoice</MenuItem>
                  <MenuItem value="shipping">Shipping Label</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Save />}
                onClick={saveCustomPreset}
                sx={{ mb: 2 }}
              >
                Save Current as Preset
              </Button>
            </SettingGroup>

            <SettingGroup>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Paper Size</InputLabel>
                <Select
                  value={printSettings.paperSize}
                  onChange={e => handleSettingChange('paperSize', e.target.value)}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A5">A5</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                  <MenuItem value="80mm">Receipt (80mm)</MenuItem>
                  <MenuItem value="58mm">Receipt (58mm)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={printSettings.orientation}
                  onChange={e => handleSettingChange('orientation', e.target.value)}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Margins (mm)
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Top"
                    type="number"
                    size="small"
                    value={printSettings.margins.top}
                    onChange={e => handleNestedSettingChange('margins', 'top', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Right"
                    type="number"
                    size="small"
                    value={printSettings.margins.right}
                    onChange={e => handleNestedSettingChange('margins', 'right', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Bottom"
                    type="number"
                    size="small"
                    value={printSettings.margins.bottom}
                    onChange={e => handleNestedSettingChange('margins', 'bottom', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Left"
                    type="number"
                    size="small"
                    value={printSettings.margins.left}
                    onChange={e => handleNestedSettingChange('margins', 'left', e.target.value)}
                  />
                </Grid>
              </Grid>
            </SettingGroup>
          </>
        )
      case 1: // Content
        return (
          <>
            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Logo Options
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeLogo}
                    onChange={e => handleSettingChange('includeLogo', e.target.checked)}
                  />
                }
                label="Include Logo"
              />

              {printSettings.includeLogo && (
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                  <InputLabel>Logo Size</InputLabel>
                  <Select
                    value={printSettings.logoSize}
                    onChange={e => handleSettingChange('logoSize', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              )}
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Images and Media
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.showImages}
                    onChange={e => handleSettingChange('showImages', e.target.checked)}
                  />
                }
                label="Show Product Images"
              />

              {printSettings.showImages && (
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                  <InputLabel>Image Size</InputLabel>
                  <Select
                    value={printSettings.imageSize}
                    onChange={e => handleSettingChange('imageSize', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              )}
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Codes
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeBarcode}
                    onChange={e => handleSettingChange('includeBarcode', e.target.checked)}
                  />
                }
                label="Include Barcode"
              />

              {printSettings.includeBarcode && (
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                  <InputLabel>Barcode Type</InputLabel>
                  <Select
                    value={printSettings.barcodeType}
                    onChange={e => handleSettingChange('barcodeType', e.target.value)}
                  >
                    <MenuItem value="code128">Code 128</MenuItem>
                    <MenuItem value="code39">Code 39</MenuItem>
                    <MenuItem value="ean13">EAN-13</MenuItem>
                    <MenuItem value="upc">UPC</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeQR}
                    onChange={e => handleSettingChange('includeQR', e.target.checked)}
                  />
                }
                label="Include QR Code"
              />
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Additional Content
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeNotes}
                    onChange={e => handleSettingChange('includeNotes', e.target.checked)}
                  />
                }
                label="Include Notes"
              />

              {printSettings.includeNotes && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Order Notes"
                  value={printSettings.notes}
                  onChange={e => handleSettingChange('notes', e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </SettingGroup>
          </>
        )
      case 2: // Branding
        return (
          <>
            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Primary Color"
                  type="color"
                  value={printSettings.primaryColor}
                  onChange={e => handleSettingChange('primaryColor', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Secondary Color"
                  type="color"
                  value={printSettings.secondaryColor}
                  onChange={e => handleSettingChange('secondaryColor', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Typography
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={printSettings.fontFamily}
                  onChange={e => handleSettingChange('fontFamily', e.target.value)}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Calibri">Calibri</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>Font Size: {printSettings.fontSize}px</Typography>
              <Slider
                value={printSettings.fontSize}
                onChange={(e, newValue) => handleSettingChange('fontSize', newValue)}
                min={8}
                max={16}
                step={1}
                marks
                sx={{ mb: 2 }}
              />

              <Typography gutterBottom>Line Height: {printSettings.lineHeight}</Typography>
              <Slider
                value={printSettings.lineHeight}
                onChange={(e, newValue) => handleSettingChange('lineHeight', newValue)}
                min={1}
                max={2}
                step={0.1}
                marks
                sx={{ mb: 2 }}
              />
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Watermark
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeWatermark}
                    onChange={e => handleSettingChange('includeWatermark', e.target.checked)}
                  />
                }
                label="Include Watermark"
              />

              {printSettings.includeWatermark && (
                <>
                  <TextField
                    fullWidth
                    label="Watermark Text"
                    value={printSettings.watermarkText}
                    onChange={e => handleSettingChange('watermarkText', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />

                  <Typography gutterBottom>Opacity: {printSettings.watermarkOpacity}</Typography>
                  <Slider
                    value={printSettings.watermarkOpacity}
                    onChange={(e, newValue) => handleSettingChange('watermarkOpacity', newValue)}
                    min={0.05}
                    max={0.3}
                    step={0.05}
                    marks
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </SettingGroup>
          </>
        )
      case 3: // Advanced
        return (
          <>
            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Page Options
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.pageNumbers}
                    onChange={e => handleSettingChange('pageNumbers', e.target.checked)}
                  />
                }
                label="Show Page Numbers"
              />

              {printSettings.pageNumbers && (
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                  <InputLabel>Page Number Position</InputLabel>
                  <Select
                    value={printSettings.pageNumberPosition}
                    onChange={e => handleSettingChange('pageNumberPosition', e.target.value)}
                  >
                    <MenuItem value="bottom-center">Bottom Center</MenuItem>
                    <MenuItem value="bottom-right">Bottom Right</MenuItem>
                    <MenuItem value="bottom-left">Bottom Left</MenuItem>
                  </Select>
                </FormControl>
              )}
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Print Quality
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Resolution</InputLabel>
                <Select
                  value={printSettings.resolution}
                  onChange={e => handleSettingChange('resolution', Number(e.target.value))}
                >
                  <MenuItem value={72}>Draft (72 DPI)</MenuItem>
                  <MenuItem value={150}>Standard (150 DPI)</MenuItem>
                  <MenuItem value={300}>High (300 DPI)</MenuItem>
                  <MenuItem value={600}>Ultra High (600 DPI)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Color Mode</InputLabel>
                <Select
                  value={printSettings.colorMode}
                  onChange={e => handleSettingChange('colorMode', e.target.value)}
                >
                  <MenuItem value="color">Full Color</MenuItem>
                  <MenuItem value="grayscale">Grayscale</MenuItem>
                  <MenuItem value="blackwhite">Black & White</MenuItem>
                </Select>
              </FormControl>
            </SettingGroup>

            <SettingGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Security Features
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={printSettings.includeSecurityFeatures}
                    onChange={e => handleSettingChange('includeSecurityFeatures', e.target.checked)}
                  />
                }
                label="Enable Security Features"
              />

              {printSettings.includeSecurityFeatures && (
                <>
                  <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                    <InputLabel>Security Level</InputLabel>
                    <Select
                      value={printSettings.securityLevel}
                      onChange={e => handleSettingChange('securityLevel', e.target.value)}
                    >
                      <MenuItem value="basic">Basic</MenuItem>
                      <MenuItem value="enhanced">Enhanced</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={printSettings.includeTimestamp}
                        onChange={e => handleSettingChange('includeTimestamp', e.target.checked)}
                      />
                    }
                    label="Include Timestamp"
                  />
                </>
              )}
            </SettingGroup>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isLoading ? 'Loading...' : `Print Order #${order?.orderId || 'Unknown'}`}
          </Typography>
          <Tooltip title="Save Settings">
            <IconButton onClick={saveCustomPreset}>
              <Save />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, height: 'calc(100% - 130px)' }}>
        {printError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {printError}
          </Alert>
        )}
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <PrintManagerContainer>
            <SettingsPanel>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  icon={<Description sx={{ fontSize: 20 }} />}
                  label="Document"
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<Image sx={{ fontSize: 20 }} />}
                  label="Content"
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<ColorLens sx={{ fontSize: 20 }} />}
                  label="Branding"
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<Settings sx={{ fontSize: 20 }} />}
                  label="Advanced"
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
              </Tabs>

              {renderTabContent()}
            </SettingsPanel>

            <PrintContent ref={printRef} order={order} printSettings={printSettings} />
          </PrintManagerContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isPrinting ? <CircularProgress size={20} /> : <Print />}
          onClick={handlePrint}
          disabled={isPrinting}
          sx={{
            fontWeight: 'bold',
            minWidth: '120px',
            height: '40px',
            borderRadius: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            },
            '&.Mui-disabled': {
              background: 'linear-gradient(45deg, #BDBDBD 30%, #E0E0E0 90%)',
              color: 'white',
            },
          }}
        >
          {isPrinting ? 'Printing...' : 'Print Now'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OrderPrintManager
