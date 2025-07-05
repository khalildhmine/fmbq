'use client'

import React, { useRef, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Printer, Package, FileText } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { QRCodeSVG } from 'qrcode.react'

const formatPrice = value => {
  const num = parseFloat(value)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

const PrintOrderModal = ({ isOpen, onClose, order }) => {
  const [printType, setPrintType] = useState('invoice')
  const componentRef = useRef(null)

  // Handle nested order structure
  const orderData = order?.order || order

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Changed from 'content' to 'contentRef'
    documentTitle: `${printType === 'invoice' ? 'Invoice' : 'Shipping-Label'}-${
      orderData?.orderId || 'Order'
    }`,
    onBeforeGetContent: () => {
      // Ensure the content is ready
      return new Promise(resolve => {
        resolve()
      })
    },
    onPrintError: error => {
      console.error('Print failed:', error)
    },
  })

  // If no order, don't render anything
  if (!isOpen || !order || !orderData) {
    return null
  }

  // Get order items from either cart or items array
  const items = orderData.items || orderData.cart || []

  // Calculate totals with proper fallbacks
  const subtotal =
    orderData.subtotalBeforeDiscounts ||
    items.reduce((acc, item) => {
      const price = parseFloat(item.price || item.discountedPrice || item.originalPrice || 0)
      const quantity = parseInt(item.quantity || 1)
      return acc + price * quantity
    }, 0)

  const discount = orderData.totalDiscount || 0
  const shipping = parseFloat(orderData.shipping || 0)
  const total = parseFloat(
    orderData.totalPrice || orderData.amount || subtotal - discount + shipping
  )

  // Extract customer and address info
  const customer = orderData.user || {}
  const customerName = customer.name || orderData.customer || 'Anonymous'
  const customerEmail = customer.email || ''
  const customerMobile = orderData.mobile || ''
  const address = orderData.address || orderData.shippingAddress || {}

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-4xl w-full mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <Dialog.Title className="text-xl font-semibold">Print Documents</Dialog.Title>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="flex gap-4 p-6 border-b">
              <button
                onClick={() => setPrintType('invoice')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  printType === 'shipping'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package className="h-5 w-5" />
                Shipping Label
              </button>
            </div>

            {/* Print Preview Area */}
            <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div ref={componentRef}>
                {/* Invoice Template */}
                {printType === 'invoice' && (
                  <div className="p-8 bg-white">
                    {/* Company Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800">fq INC</h1>
                        <p className="text-gray-600">123 Commerce Street</p>
                        <p className="text-gray-600">Nouakchott, Mauritania</p>
                        <p className="text-gray-600">support@maisonadrar.com</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                        <p className="text-gray-600">
                          Order #: {orderData.orderId || orderData._id}
                        </p>
                        <p className="text-gray-600">
                          Date:{' '}
                          {new Date(
                            orderData.createdAt || orderData.date || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                      <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
                      <p className="text-gray-700">{customerName}</p>
                      {customerEmail && <p className="text-gray-600">{customerEmail}</p>}
                      {address.street && <p className="text-gray-600">{address.street}</p>}
                      {address.area && <p className="text-gray-600">{address.area}</p>}
                      {address.city && (
                        <p className="text-gray-600">
                          {address.city}
                          {address.province && `, ${address.province}`}
                          {address.postalCode && ` ${address.postalCode}`}
                        </p>
                      )}
                      {customerMobile && <p className="text-gray-600">{customerMobile}</p>}
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
                        {items.map((item, index) => {
                          const price = parseFloat(
                            item.price || item.discountedPrice || item.originalPrice || 0
                          )
                          const quantity = parseInt(item.quantity || 1)
                          const amount = price * quantity

                          return (
                            <tr key={item._id || index} className="border-b border-gray-200">
                              <td className="py-3 text-gray-700">
                                <div>
                                  <p className="font-medium">
                                    {item.name || item.title || 'Untitled Product'}
                                  </p>
                                  {item.color && (
                                    <p className="text-sm text-gray-500">
                                      Color: {item.color.name}
                                    </p>
                                  )}
                                  {item.size && (
                                    <p className="text-sm text-gray-500">Size: {item.size.size}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-right text-gray-700">{quantity}</td>
                              <td className="py-3 text-right text-gray-700">
                                {formatPrice(price)} MRU
                              </td>
                              <td className="py-3 text-right text-gray-700">
                                {formatPrice(amount)} MRU
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="pt-4 text-right font-semibold">
                            Subtotal:
                          </td>
                          <td className="pt-4 text-right text-gray-700">
                            {formatPrice(subtotal)} MRU
                          </td>
                        </tr>
                        {discount > 0 && (
                          <tr>
                            <td
                              colSpan="3"
                              className="pt-2 text-right font-semibold text-green-600"
                            >
                              Discount:
                            </td>
                            <td className="pt-2 text-right text-green-600">
                              -{formatPrice(discount)} MRU
                            </td>
                          </tr>
                        )}
                        {shipping > 0 && (
                          <tr>
                            <td colSpan="3" className="pt-2 text-right font-semibold">
                              Shipping:
                            </td>
                            <td className="pt-2 text-right text-gray-700">
                              {formatPrice(shipping)} MRU
                            </td>
                          </tr>
                        )}
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
                            Method: {orderData.paymentMethod || 'N/A'}
                          </p>
                          <p className="text-gray-600">
                            Status:{' '}
                            {orderData.paymentVerification?.status ||
                              orderData.paymentStatus ||
                              'pending'}
                          </p>
                        </div>
                        <div className="text-right">
                          <QRCodeSVG
                            value={orderData.orderId || orderData._id || 'N/A'}
                            size={100}
                          />
                          <p className="text-sm text-gray-500 mt-2">Scan for order tracking</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Label Template */}
                {printType === 'shipping' && (
                  <div className="p-8 bg-white border-2 border-gray-300 rounded-lg">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">FQ AIR INC SHIPPING</h1>
                      <p className="text-gray-600">Express Delivery</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <h3 className="font-bold mb-2">From:</h3>
                        <p>fq air INC</p>
                        <p>Nouakchott, Mauritania</p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">To:</h3>
                        <p className="font-bold">{customerName}</p>
                        {address.street && <p>{address.street}</p>}
                        {address.area && <p>{address.area}</p>}
                        {address.city && (
                          <p>
                            {address.city}
                            {address.province && `, ${address.province}`}
                            {address.postalCode && ` ${address.postalCode}`}
                          </p>
                        )}
                        {customerMobile && <p>{customerMobile}</p>}
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold mb-2">
                        Order #: {orderData.orderId || orderData._id}
                      </div>
                      <QRCodeSVG value={orderData.orderId || orderData._id || 'N/A'} size={150} />
                      <p className="text-sm mt-2">Scan for tracking information</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Total Items: {orderData.totalItems || items.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Amount: {formatPrice(total)} MRU
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}

export default PrintOrderModal
