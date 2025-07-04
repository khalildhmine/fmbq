'use client'

import React, { useRef, useState, useEffect } from 'react'
import { X, Printer, Package, FileText, AlertCircle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import QRCode from 'qrcode.react'

const formatPrice = value => {
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }
  return '0.00'
}

const validateOrderItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: 'Order items are missing or invalid' }
  }

  const validatedItems = items.map(item => ({
    id: item._id || item.id || '',
    name: item.name || item.title || 'Untitled Product',
    price: parseFloat(item.price || item.discountedPrice || item.originalPrice || 0),
    quantity: parseInt(item.quantity || 1),
    image: item.image || item.img?.url || '/placeholder.png',
    size: item.size || {},
    color: item.color || {},
  }))

  return { isValid: true, items: validatedItems }
}

const PrintOrderModal = ({ isOpen, onClose, order }) => {
  const [printType, setPrintType] = useState('invoice')
  const [validationError, setValidationError] = useState(null)
  const [processedOrder, setProcessedOrder] = useState(null)
  const invoicePrintRef = useRef(null)
  const shippingLabelRef = useRef(null)

  useEffect(() => {
    if (order) {
      try {
        // Validate and process order data
        const { isValid, error, items } = validateOrderItems(order.items || order.cart || [])

        if (!isValid) {
          setValidationError(error)
          return
        }

        // Process the order data
        const processed = {
          _id: order._id || '',
          orderId: order.orderId || order._id || '',
          customer: order.user?.name || order.user?.email || order.customer || 'Anonymous',
          createdAt: order.createdAt || order.date || new Date().toISOString(),
          amount: parseFloat(order.amount || order.totalPrice || 0),
          status: order.status || 'pending',
          items: items,
          totalItems: order.totalItems || items.length || 0,
          paymentMethod: order.paymentMethod || 'N/A',
          paymentStatus: order.paymentStatus || 'N/A',
          mobile: order.mobile || order.phone || 'N/A',
          shippingAddress: order.address || order.shippingAddress || {},
          shipping: parseFloat(order.shipping || 0),
          trackingNumber: order.trackingNumber || `TN${order._id?.toString().slice(-6)}`,
        }

        setProcessedOrder(processed)
        setValidationError(null)
      } catch (error) {
        console.error('Error processing order:', error)
        setValidationError('Failed to process order data')
      }
    }
  }, [order])

  const handlePrintContent = () => {
    return printType === 'invoice' ? invoicePrintRef.current : shippingLabelRef.current
  }

  const handlePrint = useReactToPrint({
    content: handlePrintContent,
    documentTitle: `${printType === 'invoice' ? 'Invoice' : 'Shipping-Label'}-${processedOrder?.orderId || 'Details'}`,
    onAfterPrint: () => {
      console.log('Print completed')
    },
  })

  if (!order || !isOpen) return null
  if (validationError) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Validation Error</h3>
            <p className="text-gray-600 text-center mb-6">{validationError}</p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!processedOrder) return null

  // Calculate totals safely
  const calculateItemTotal = item => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return price * quantity
  }

  const subtotal = processedOrder.items.reduce((acc, item) => acc + calculateItemTotal(item), 0)
  const shipping = processedOrder.shipping || 0
  const total = processedOrder.amount || subtotal + shipping

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Print Documents</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="h-5 w-5" />
                Print
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Document Type Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setPrintType('invoice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                printType === 'invoice'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-5 w-5" />
              Invoice
            </button>
            <button
              onClick={() => setPrintType('shipping')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                printType === 'shipping'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="h-5 w-5" />
              Shipping Label
            </button>
          </div>

          {/* Invoice Template */}
          <div className={printType === 'invoice' ? 'block' : 'hidden'}>
            <div ref={invoicePrintRef} className="p-8 bg-white">
              {/* Company Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">MAISON ADRAR</h1>
                  <p className="text-gray-600">123 Commerce Street</p>
                  <p className="text-gray-600">Nouakchott, Mauritania</p>
                  <p className="text-gray-600">support@maisonadrar.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-600">Order #: {processedOrder.orderId}</p>
                  <p className="text-gray-600">
                    Date: {new Date(processedOrder.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-gray-600">Tracking #: {processedOrder.trackingNumber}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-8">
                <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
                <p className="text-gray-700">{processedOrder.customer}</p>
                <p className="text-gray-600">{processedOrder.shippingAddress?.street}</p>
                <p className="text-gray-600">
                  {processedOrder.shippingAddress?.city}, {processedOrder.shippingAddress?.state}
                </p>
                <p className="text-gray-600">{processedOrder.shippingAddress?.country}</p>
                <p className="text-gray-600">Phone: {processedOrder.mobile}</p>
              </div>

              {/* Order Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="py-2 text-left text-gray-600">Description</th>
                    <th className="py-2 text-right text-gray-600">Quantity</th>
                    <th className="py-2 text-right text-gray-600">Unit Price</th>
                    <th className="py-2 text-right text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {processedOrder.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 text-gray-700">{item.name}</td>
                      <td className="py-3 text-right text-gray-700">{item.quantity || 1}</td>
                      <td className="py-3 text-right text-gray-700">
                        {formatPrice(item.price)} MRU
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {formatPrice(calculateItemTotal(item))} MRU
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="pt-4 text-right font-semibold">
                      Subtotal:
                    </td>
                    <td className="pt-4 text-right text-gray-700">{formatPrice(subtotal)} MRU</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="pt-2 text-right font-semibold">
                      Shipping:
                    </td>
                    <td className="pt-2 text-right text-gray-700">{formatPrice(shipping)} MRU</td>
                  </tr>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan="3" className="pt-2 text-right font-bold">
                      Total:
                    </td>
                    <td className="pt-2 text-right font-bold">{formatPrice(total)} MRU</td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold mb-2">Payment Information</h4>
                    <p className="text-gray-600">
                      Payment Method: {processedOrder.paymentMethod || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      Payment Status: {processedOrder.paymentStatus || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <QRCode value={processedOrder.orderId} size={64} />
                    <p className="text-sm text-gray-500 mt-2">Scan for order tracking</p>
                  </div>
                </div>
                <div className="text-center mt-8 text-gray-500">
                  <p>Thank you for shopping with Maison Adrar!</p>
                  <p className="text-sm">
                    For any questions, please contact support@maisonadrar.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Label Template */}
          <div className={printType === 'shipping' ? 'block' : 'hidden'}>
            <div
              ref={shippingLabelRef}
              className="p-8 bg-white border-2 border-gray-300 rounded-lg"
            >
              {/* Shipping Label Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">MAISON ADRAR SHIPPING</h1>
                <p className="text-gray-600">Express Delivery</p>
              </div>

              {/* Tracking Barcode */}
              <div className="mb-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-black text-white px-4 py-2 text-center font-mono">
                    {processedOrder.trackingNumber}
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-bold mb-2">From:</h3>
                  <p>Maison Adrar</p>
                  <p>123 Commerce Street</p>
                  <p>Nouakchott, Mauritania</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">To:</h3>
                  <p className="font-bold">{processedOrder.customer}</p>
                  <p>{processedOrder.shippingAddress?.street}</p>
                  <p>
                    {processedOrder.shippingAddress?.city}, {processedOrder.shippingAddress?.state}
                  </p>
                  <p>{processedOrder.shippingAddress?.country}</p>
                  <p>Phone: {processedOrder.mobile}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-6">
                <p>
                  <strong>Order ID:</strong> {processedOrder.orderId}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(processedOrder.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <p>
                  <strong>Package Weight:</strong> {processedOrder.weight || 'N/A'}
                </p>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <QRCode
                  value={`${processedOrder.orderId}-${processedOrder.trackingNumber}`}
                  size={120}
                />
                <p className="text-sm mt-2">Scan for tracking information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintOrderModal
