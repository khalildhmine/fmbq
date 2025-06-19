// // 'use client'

// // import React, { useRef, useState } from 'react'
// // import { X, Printer, Package, FileText } from 'lucide-react'
// // import { useReactToPrint } from 'react-to-print'
// // import QRCode from 'qrcode.react'

// // const formatPrice = value => {
// //   if (typeof value === 'number') {
// //     return value.toFixed(2)
// //   }
// //   if (typeof value === 'string') {
// //     const num = parseFloat(value)
// //     return isNaN(num) ? '0.00' : num.toFixed(2)
// //   }
// //   return '0.00'
// // }

// // const PrintOrderModal = ({ isOpen, onClose, order }) => {
// //   const [printType, setPrintType] = useState('invoice')
// //   const invoicePrintRef = useRef(null)
// //   const shippingLabelRef = useRef(null)

// //   const handlePrintContent = () => {
// //     return printType === 'invoice' ? invoicePrintRef.current : shippingLabelRef.current
// //   }

// //   const handlePrint = useReactToPrint({
// //     content: handlePrintContent,
// //     documentTitle: `${printType === 'invoice' ? 'Invoice' : 'Shipping-Label'}-${order?.orderId || 'Details'}`,
// //     onAfterPrint: () => {
// //       console.log('Print completed')
// //     },
// //   })

// //   if (!order || !isOpen) return null

// //   // Calculate totals safely
// //   const calculateItemTotal = item => {
// //     const price = parseFloat(item.price) || 0
// //     const quantity = parseInt(item.quantity) || 0
// //     return price * quantity
// //   }

// //   const subtotal = order.items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) || 0
// //   const shipping = parseFloat(order.shipping) || 0
// //   const total = parseFloat(order.amount) || subtotal + shipping

// //   // Generate tracking number if not exists
// //   const trackingNumber = order.trackingNumber || `TN${order.orderId.replace(/[^0-9]/g, '')}`

// //   return (
// //     <div className="fixed inset-0 z-50 overflow-y-auto">
// //       <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
// //       <div className="flex items-center justify-center min-h-screen">
// //         <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-6">
// //           {/* Header */}
// //           <div className="flex justify-between items-center mb-6">
// //             <h2 className="text-xl font-semibold">Print Documents</h2>
// //             <div className="flex items-center gap-4">
// //               <button
// //                 onClick={handlePrint}
// //                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //               >
// //                 <Printer className="h-5 w-5" />
// //                 Print
// //               </button>
// //               <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
// //                 <X className="h-6 w-6" />
// //               </button>
// //             </div>
// //           </div>

// //           {/* Document Type Selector */}
// //           <div className="flex gap-4 mb-6">
// //             <button
// //               onClick={() => setPrintType('invoice')}
// //               className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
// //                 printType === 'invoice'
// //                   ? 'bg-blue-600 text-white'
// //                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //               }`}
// //             >
// //               <FileText className="h-5 w-5" />
// //               Invoice
// //             </button>
// //             <button
// //               onClick={() => setPrintType('shipping')}
// //               className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
// //                 printType === 'shipping'
// //                   ? 'bg-blue-600 text-white'
// //                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //               }`}
// //             >
// //               <Package className="h-5 w-5" />
// //               Shipping Label
// //             </button>
// //           </div>

// //           {/* Invoice Template */}
// //           <div className={printType === 'invoice' ? 'block' : 'hidden'}>
// //             <div ref={invoicePrintRef} className="p-8 bg-white">
// //               {/* Company Header */}
// //               <div className="flex justify-between items-start mb-8">
// //                 <div>
// //                   <h1 className="text-2xl font-bold text-gray-800">MAISON ADRAR</h1>
// //                   <p className="text-gray-600">123 Commerce Street</p>
// //                   <p className="text-gray-600">Nouakchott, Mauritania</p>
// //                   <p className="text-gray-600">support@maisonadrar.com</p>
// //                 </div>
// //                 <div className="text-right">
// //                   <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
// //                   <p className="text-gray-600">Order #: {order.orderId}</p>
// //                   <p className="text-gray-600">
// //                     Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
// //                   </p>
// //                   <p className="text-gray-600">Tracking #: {trackingNumber}</p>
// //                 </div>
// //               </div>

// //               {/* Customer Info */}
// //               <div className="mb-8">
// //                 <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
// //                 <p className="text-gray-700">{order.customer}</p>
// //                 <p className="text-gray-600">{order.shippingAddress?.street}</p>
// //                 <p className="text-gray-600">
// //                   {order.shippingAddress?.city}, {order.shippingAddress?.state}
// //                 </p>
// //                 <p className="text-gray-600">{order.shippingAddress?.country}</p>
// //                 <p className="text-gray-600">Phone: {order.mobile || 'N/A'}</p>
// //               </div>

// //               {/* Order Items */}
// //               <table className="w-full mb-8">
// //                 <thead>
// //                   <tr className="border-b-2 border-gray-300">
// //                     <th className="py-2 text-left text-gray-600">Description</th>
// //                     <th className="py-2 text-right text-gray-600">Quantity</th>
// //                     <th className="py-2 text-right text-gray-600">Unit Price</th>
// //                     <th className="py-2 text-right text-gray-600">Amount</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {order.items?.map((item, index) => (
// //                     <tr key={index} className="border-b border-gray-200">
// //                       <td className="py-3 text-gray-700">{item.name}</td>
// //                       <td className="py-3 text-right text-gray-700">{item.quantity || 1}</td>
// //                       <td className="py-3 text-right text-gray-700">
// //                         {formatPrice(item.price)} MRU
// //                       </td>
// //                       <td className="py-3 text-right text-gray-700">
// //                         {formatPrice(calculateItemTotal(item))} MRU
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //                 <tfoot>
// //                   <tr>
// //                     <td colSpan="3" className="pt-4 text-right font-semibold">
// //                       Subtotal:
// //                     </td>
// //                     <td className="pt-4 text-right text-gray-700">{formatPrice(subtotal)} MRU</td>
// //                   </tr>
// //                   <tr>
// //                     <td colSpan="3" className="pt-2 text-right font-semibold">
// //                       Shipping:
// //                     </td>
// //                     <td className="pt-2 text-right text-gray-700">{formatPrice(shipping)} MRU</td>
// //                   </tr>
// //                   <tr className="border-t-2 border-gray-300">
// //                     <td colSpan="3" className="pt-2 text-right font-bold">
// //                       Total:
// //                     </td>
// //                     <td className="pt-2 text-right font-bold">{formatPrice(total)} MRU</td>
// //                   </tr>
// //                 </tfoot>
// //               </table>

// //               {/* Footer */}
// //               <div className="mt-8 pt-8 border-t border-gray-200">
// //                 <div className="flex justify-between">
// //                   <div>
// //                     <h4 className="font-semibold mb-2">Payment Information</h4>
// //                     <p className="text-gray-600">Payment Method: {order.paymentMethod || 'N/A'}</p>
// //                     <p className="text-gray-600">Payment Status: {order.paymentStatus || 'N/A'}</p>
// //                   </div>
// //                   <div className="text-right">
// //                     <QRCode value={order.orderId} size={64} />
// //                     <p className="text-sm text-gray-500 mt-2">Scan for order tracking</p>
// //                   </div>
// //                 </div>
// //                 <div className="text-center mt-8 text-gray-500">
// //                   <p>Thank you for shopping with Maison Adrar!</p>
// //                   <p className="text-sm">
// //                     For any questions, please contact support@maisonadrar.com
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Shipping Label Template */}
// //           <div className={printType === 'shipping' ? 'block' : 'hidden'}>
// //             <div
// //               ref={shippingLabelRef}
// //               className="p-8 bg-white border-2 border-gray-300 rounded-lg"
// //             >
// //               {/* Shipping Label Header */}
// //               <div className="text-center mb-6">
// //                 <h1 className="text-2xl font-bold">MAISON ADRAR SHIPPING</h1>
// //                 <p className="text-gray-600">Express Delivery</p>
// //               </div>

// //               {/* Tracking Barcode */}
// //               <div className="mb-6 text-center">
// //                 <div className="flex justify-center">
// //                   <div className="bg-black text-white px-4 py-2 text-center font-mono">
// //                     {trackingNumber}
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Addresses */}
// //               <div className="grid grid-cols-2 gap-8 mb-6">
// //                 <div>
// //                   <h3 className="font-bold mb-2">From:</h3>
// //                   <p>Maison Adrar</p>
// //                   <p>123 Commerce Street</p>
// //                   <p>Nouakchott, Mauritania</p>
// //                 </div>
// //                 <div>
// //                   <h3 className="font-bold mb-2">To:</h3>
// //                   <p className="font-bold">{order.customer}</p>
// //                   <p>{order.shippingAddress?.street}</p>
// //                   <p>
// //                     {order.shippingAddress?.city}, {order.shippingAddress?.state}
// //                   </p>
// //                   <p>{order.shippingAddress?.country}</p>
// //                   <p>Phone: {order.mobile || 'N/A'}</p>
// //                 </div>
// //               </div>

// //               {/* Order Details */}
// //               <div className="mb-6">
// //                 <p>
// //                   <strong>Order ID:</strong> {order.orderId}
// //                 </p>
// //                 <p>
// //                   <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('fr-FR')}
// //                 </p>
// //                 <p>
// //                   <strong>Package Weight:</strong> {order.weight || 'N/A'}
// //                 </p>
// //               </div>

// //               {/* QR Code */}
// //               <div className="text-center">
// //                 <QRCode value={`${order.orderId}-${trackingNumber}`} size={120} />
// //                 <p className="text-sm mt-2">Scan for tracking information</p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // export default PrintOrderModal

// 'use client'

// import React, { useRef, useState } from 'react'
// import { X, Printer, Package, FileText } from 'lucide-react'
// import { useReactToPrint } from 'react-to-print'

// const formatPrice = value => {
//   if (typeof value === 'number') {
//     return value.toFixed(2)
//   }
//   if (typeof value === 'string') {
//     const num = parseFloat(value)
//     return isNaN(num) ? '0.00' : num.toFixed(2)
//   }
//   return '0.00'
// }

// const formatDate = dateInput => {
//   if (!dateInput) return 'N/A'

//   try {
//     const date = new Date(dateInput)
//     if (isNaN(date.getTime())) return 'N/A'

//     return date.toLocaleDateString('fr-FR', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     })
//   } catch (error) {
//     console.error('Date formatting error:', error)
//     return 'N/A'
//   }
// }

// // Simple QR Code component replacement
// const SimpleQRCode = ({ value, size = 64 }) => {
//   return (
//     <div
//       className="bg-gray-900 text-white flex items-center justify-center font-mono text-xs"
//       style={{
//         width: size,
//         height: size,
//         fontSize: size < 100 ? '8px' : '10px',
//       }}
//     >
//       {value.slice(0, 8)}
//     </div>
//   )
// }

// const PrintOrderModal = ({ isOpen, onClose, order }) => {
//   const [printType, setPrintType] = useState('invoice')
//   const invoicePrintRef = useRef(null)
//   const shippingLabelRef = useRef(null)

//   const handlePrintContent = () => {
//     return printType === 'invoice' ? invoicePrintRef.current : shippingLabelRef.current
//   }

//   const handlePrint = useReactToPrint({
//     content: handlePrintContent,
//     documentTitle: `${printType === 'invoice' ? 'Invoice' : 'Shipping-Label'}-${order?.orderId || 'Details'}`,
//     onAfterPrint: () => {
//       console.log('Print completed')
//     },
//   })

//   if (!order || !isOpen) return null

//   // Calculate totals safely
//   const calculateItemTotal = item => {
//     const price = parseFloat(item.price) || 0
//     const quantity = parseInt(item.quantity) || 0
//     return price * quantity
//   }

//   const subtotal = order.items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) || 0
//   const shipping = parseFloat(order.shipping) || 0
//   const total = parseFloat(order.amount) || subtotal + shipping

//   // Generate tracking number if not exists
//   const trackingNumber =
//     order.trackingNumber ||
//     `TN${order.orderId?.replace(/[^0-9]/g, '') || Math.random().toString().slice(2, 8)}`

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 p-6">
//           {/* Header */}
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold">Print Documents</h2>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={handlePrint}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 <Printer className="h-5 w-5" />
//                 Print
//               </button>
//               <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//           </div>

//           {/* Document Type Selector */}
//           <div className="flex gap-4 mb-6">
//             <button
//               onClick={() => setPrintType('invoice')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
//                 printType === 'invoice'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               <FileText className="h-5 w-5" />
//               Invoice
//             </button>
//             <button
//               onClick={() => setPrintType('shipping')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
//                 printType === 'shipping'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               <Package className="h-5 w-5" />
//               Shipping Label
//             </button>
//           </div>

//           {/* Invoice Template */}
//           <div className={printType === 'invoice' ? 'block' : 'hidden'}>
//             <div ref={invoicePrintRef} className="p-8 bg-white">
//               {/* Company Header */}
//               <div className="flex justify-between items-start mb-8">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">MAISON ADRAR</h1>
//                   <p className="text-gray-600">123 Commerce Street</p>
//                   <p className="text-gray-600">Nouakchott, Mauritania</p>
//                   <p className="text-gray-600">support@maisonadrar.com</p>
//                 </div>
//                 <div className="text-right">
//                   <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
//                   <p className="text-gray-600">Order #: {order.orderId || 'N/A'}</p>
//                   <p className="text-gray-600">Date: {formatDate(order.createdAt || order.date)}</p>
//                   <p className="text-gray-600">Tracking #: {trackingNumber}</p>
//                 </div>
//               </div>

//               {/* Customer Info */}
//               <div className="mb-8">
//                 <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
//                 <p className="text-gray-700">{order.customer || 'N/A'}</p>
//                 <p className="text-gray-600">{order.shippingAddress?.street || 'N/A'}</p>
//                 <p className="text-gray-600">
//                   {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
//                 </p>
//                 <p className="text-gray-600">{order.shippingAddress?.country || 'N/A'}</p>
//                 <p className="text-gray-600">Phone: {order.mobile || 'N/A'}</p>
//               </div>

//               {/* Order Items */}
//               <table className="w-full mb-8">
//                 <thead>
//                   <tr className="border-b-2 border-gray-300">
//                     <th className="py-2 text-left text-gray-600">Description</th>
//                     <th className="py-2 text-right text-gray-600">Quantity</th>
//                     <th className="py-2 text-right text-gray-600">Unit Price</th>
//                     <th className="py-2 text-right text-gray-600">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {order.items?.map((item, index) => (
//                     <tr key={index} className="border-b border-gray-200">
//                       <td className="py-3 text-gray-700">{item.name || 'N/A'}</td>
//                       <td className="py-3 text-right text-gray-700">{item.quantity || 1}</td>
//                       <td className="py-3 text-right text-gray-700">
//                         {formatPrice(item.price)} MRU
//                       </td>
//                       <td className="py-3 text-right text-gray-700">
//                         {formatPrice(calculateItemTotal(item))} MRU
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr>
//                     <td colSpan="3" className="pt-4 text-right font-semibold">
//                       Subtotal:
//                     </td>
//                     <td className="pt-4 text-right text-gray-700">{formatPrice(subtotal)} MRU</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="3" className="pt-2 text-right font-semibold">
//                       Shipping:
//                     </td>
//                     <td className="pt-2 text-right text-gray-700">{formatPrice(shipping)} MRU</td>
//                   </tr>
//                   <tr className="border-t-2 border-gray-300">
//                     <td colSpan="3" className="pt-2 text-right font-bold">
//                       Total:
//                     </td>
//                     <td className="pt-2 text-right font-bold">{formatPrice(total)} MRU</td>
//                   </tr>
//                 </tfoot>
//               </table>

//               {/* Footer */}
//               <div className="mt-8 pt-8 border-t border-gray-200">
//                 <div className="flex justify-between">
//                   <div>
//                     <h4 className="font-semibold mb-2">Payment Information</h4>
//                     <p className="text-gray-600">Payment Method: {order.paymentMethod || 'N/A'}</p>
//                     <p className="text-gray-600">Payment Status: {order.paymentStatus || 'N/A'}</p>
//                   </div>
//                   <div className="text-right">
//                     <SimpleQRCode value={order.orderId || 'ORDER'} size={64} />
//                     <p className="text-sm text-gray-500 mt-2">Scan for order tracking</p>
//                   </div>
//                 </div>
//                 <div className="text-center mt-8 text-gray-500">
//                   <p>Thank you for shopping with Maison Adrar!</p>
//                   <p className="text-sm">
//                     For any questions, please contact support@maisonadrar.com
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Shipping Label Template */}
//           <div className={printType === 'shipping' ? 'block' : 'hidden'}>
//             <div
//               ref={shippingLabelRef}
//               className="p-8 bg-white border-2 border-gray-300 rounded-lg"
//             >
//               {/* Shipping Label Header */}
//               <div className="text-center mb-6">
//                 <h1 className="text-2xl font-bold">MAISON ADRAR SHIPPING</h1>
//                 <p className="text-gray-600">Express Delivery</p>
//               </div>

//               {/* Tracking Barcode */}
//               <div className="mb-6 text-center">
//                 <div className="flex justify-center">
//                   <div className="bg-black text-white px-4 py-2 text-center font-mono">
//                     {trackingNumber}
//                   </div>
//                 </div>
//               </div>

//               {/* Addresses */}
//               <div className="grid grid-cols-2 gap-8 mb-6">
//                 <div>
//                   <h3 className="font-bold mb-2">From:</h3>
//                   <p>Maison Adrar</p>
//                   <p>123 Commerce Street</p>
//                   <p>Nouakchott, Mauritania</p>
//                 </div>
//                 <div>
//                   <h3 className="font-bold mb-2">To:</h3>
//                   <p className="font-bold">{order.customer || 'N/A'}</p>
//                   <p>{order.shippingAddress?.street || 'N/A'}</p>
//                   <p>
//                     {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
//                   </p>
//                   <p>{order.shippingAddress?.country || 'N/A'}</p>
//                   <p>Phone: {order.mobile || 'N/A'}</p>
//                 </div>
//               </div>

//               {/* Order Details */}
//               <div className="mb-6">
//                 <p>
//                   <strong>Order ID:</strong> {order.orderId || 'N/A'}
//                 </p>
//                 <p>
//                   <strong>Date:</strong> {formatDate(order.createdAt || order.date)}
//                 </p>
//                 <p>
//                   <strong>Package Weight:</strong> {order.weight || 'N/A'}
//                 </p>
//               </div>

//               {/* QR Code */}
//               <div className="text-center">
//                 <SimpleQRCode value={`${order.orderId || 'ORDER'}-${trackingNumber}`} size={120} />
//                 <p className="text-sm mt-2">Scan for tracking information</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PrintOrderModal

'use client'

import React, { useRef, useState, useCallback, useMemo } from 'react'
import { X, Printer, Package, FileText, AlertTriangle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

// Constants
const COMPANY_INFO = {
  name: 'MAISON ADRAR',
  address: '123 Commerce Street',
  city: 'Nouakchott, Mauritania',
  email: 'support@maisonadrar.com',
  phone: '+222 XX XX XX XX',
}

const PRINT_TYPES = {
  INVOICE: 'invoice',
  SHIPPING: 'shipping',
}

// Utility functions
const formatPrice = value => {
  if (value === null || value === undefined) return '0.00'

  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numericValue)) return '0.00'

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

const formatDate = (dateInput, locale = 'fr-FR') => {
  if (!dateInput) return 'N/A'

  try {
    const date = new Date(dateInput)

    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided:', dateInput)
      return 'N/A'
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateInput)
    return 'N/A'
  }
}

const generateTrackingNumber = orderId => {
  if (!orderId) return `TN${Date.now().toString().slice(-6)}`

  const numericPart = orderId.toString().replace(/[^0-9]/g, '')
  return numericPart ? `TN${numericPart}` : `TN${Date.now().toString().slice(-6)}`
}

const validateOrderData = order => {
  const errors = []

  if (!order) {
    errors.push('Order data is missing')
    return { isValid: false, errors }
  }

  if (!order.orderId && !order._id && !order.id) {
    errors.push('Order ID is missing')
  }

  if (!order.customer && !order.user?.name && !order.user?.email) {
    errors.push('Customer information is missing')
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order items are missing or invalid')
  }

  if (!order.createdAt && !order.date) {
    errors.push('Order date is missing')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// QR Code Component with error boundary
const QRCodeDisplay = ({ value, size = 64, className = '' }) => {
  const [hasError, setHasError] = useState(false)

  // Fallback display when QR library is not available
  const FallbackQR = () => (
    <div
      className={`bg-gray-900 text-white flex items-center justify-center font-mono border-2 border-dashed border-gray-400 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, size / 8) + 'px',
      }}
    >
      <div className="text-center">
        <div className="text-xs opacity-75">QR</div>
        <div className="font-bold">{value?.slice(0, 6) || 'CODE'}</div>
      </div>
    </div>
  )

  // You can replace this with actual QR code library when available
  return <FallbackQR />
}

// Error Display Component
const ErrorDisplay = ({ errors, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
    <div className="flex">
      <AlertTriangle className="h-5 w-5 text-red-400" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
        <div className="mt-2 text-sm text-red-700">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <button
            onClick={onClose}
            className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)

// Invoice Template Component
const InvoiceTemplate = ({ order, trackingNumber, calculations }) => (
  <div className="p-8 bg-white min-h-[297mm] max-w-[210mm] mx-auto">
    {/* Company Header */}
    <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{COMPANY_INFO.name}</h1>
        <div className="text-gray-600 space-y-1">
          <p>{COMPANY_INFO.address}</p>
          <p>{COMPANY_INFO.city}</p>
          <p>{COMPANY_INFO.email}</p>
          <p>{COMPANY_INFO.phone}</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">FACTURE</h2>
        <div className="text-gray-700 space-y-1">
          <p>
            <span className="font-semibold">N° Commande:</span>{' '}
            {order.orderId || order._id || order.id}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {formatDate(order.createdAt || order.date)}
          </p>
          <p>
            <span className="font-semibold">N° Suivi:</span> {trackingNumber}
          </p>
        </div>
      </div>
    </div>

    {/* Customer Information */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturation:</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-semibold text-gray-900">
          {order.customer || order.user?.name || order.user?.email || 'Client'}
        </p>
        {order.shippingAddress && (
          <div className="mt-2 text-gray-700 space-y-1">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <p>{order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        )}
        {order.mobile && (
          <p className="mt-2 text-gray-700">
            <span className="font-medium">Téléphone:</span> {order.mobile}
          </p>
        )}
      </div>
    </div>

    {/* Order Items Table */}
    <div className="mb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
              Description
            </th>
            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
              Quantité
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
              Prix Unitaire
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-3 text-gray-900">
                <div>
                  <p className="font-medium">{item.name || 'Article'}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                {item.quantity || 1}
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                {formatPrice(item.price)} MRU
              </td>
              <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                {formatPrice(calculations.calculateItemTotal(item))} MRU
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals Section */}
    <div className="flex justify-end mb-8">
      <div className="w-80">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Sous-total:</span>
            <span>{formatPrice(calculations.subtotal)} MRU</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Frais de livraison:</span>
            <span>{formatPrice(calculations.shipping)} MRU</span>
          </div>
          {calculations.tax > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>TVA:</span>
              <span>{formatPrice(calculations.tax)} MRU</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>{formatPrice(calculations.total)} MRU</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-3">Informations de paiement</h4>
          <div className="text-gray-700 space-y-1">
            <p>
              <span className="font-medium">Méthode:</span> {order.paymentMethod || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Statut:</span> {order.paymentStatus || 'N/A'}
            </p>
          </div>
        </div>
        <div className="text-center">
          <QRCodeDisplay value={order.orderId || order._id} size={80} />
          <p className="text-xs text-gray-500 mt-2">Scanner pour suivi</p>
        </div>
      </div>

      <div className="text-center mt-8 text-gray-600">
        <p className="mb-2">Merci pour votre confiance !</p>
        <p className="text-sm">Pour toute question, contactez-nous à {COMPANY_INFO.email}</p>
      </div>
    </div>
  </div>
)

// Shipping Label Template Component
const ShippingLabelTemplate = ({ order, trackingNumber }) => (
  <div className="p-6 bg-white border-2 border-gray-400 max-w-[148mm] min-h-[105mm] mx-auto">
    {/* Header */}
    <div className="text-center mb-4 pb-3 border-b-2 border-gray-400">
      <h1 className="text-xl font-bold text-gray-900">{COMPANY_INFO.name}</h1>
      <p className="text-sm text-gray-600">Service de livraison express</p>
    </div>

    {/* Tracking Number */}
    <div className="mb-4 text-center">
      <div className="bg-black text-white px-3 py-2 font-mono text-lg font-bold">
        {trackingNumber}
      </div>
    </div>

    {/* Addresses */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
      <div className="border border-gray-300 p-3 rounded">
        <h3 className="font-bold text-gray-900 mb-2">Expéditeur:</h3>
        <div className="text-gray-700 space-y-1">
          <p className="font-medium">{COMPANY_INFO.name}</p>
          <p>{COMPANY_INFO.address}</p>
          <p>{COMPANY_INFO.city}</p>
        </div>
      </div>
      <div className="border border-gray-300 p-3 rounded">
        <h3 className="font-bold text-gray-900 mb-2">Destinataire:</h3>
        <div className="text-gray-700 space-y-1">
          <p className="font-medium">{order.customer || order.user?.name || 'Client'}</p>
          {order.shippingAddress ? (
            <>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.country}</p>
            </>
          ) : (
            <p>Adresse non fournie</p>
          )}
          <p>
            <strong>Tel:</strong> {order.mobile || 'N/A'}
          </p>
        </div>
      </div>
    </div>

    {/* Order Details */}
    <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>N° Commande:</strong> {order.orderId || order._id}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(order.createdAt || order.date)}
          </p>
        </div>
        <div>
          <p>
            <strong>Poids:</strong> {order.weight || 'N/A'}
          </p>
          <p>
            <strong>Articles:</strong> {order.items?.length || 0}
          </p>
        </div>
      </div>
    </div>

    {/* QR Code */}
    <div className="text-center">
      <QRCodeDisplay value={`${order.orderId || order._id}-${trackingNumber}`} size={60} />
      <p className="text-xs text-gray-500 mt-1">Code de suivi</p>
    </div>
  </div>
)

// Main Component
const PrintOrderModal = ({ isOpen, onClose, order }) => {
  const [printType, setPrintType] = useState(PRINT_TYPES.INVOICE)
  const [isProcessing, setIsProcessing] = useState(false)
  const invoicePrintRef = useRef(null)
  const shippingLabelRef = useRef(null)

  // Validation
  const validation = useMemo(() => validateOrderData(order), [order])

  // Calculations
  const calculations = useMemo(() => {
    if (!order?.items)
      return { subtotal: 0, shipping: 0, tax: 0, total: 0, calculateItemTotal: () => 0 }

    const calculateItemTotal = item => {
      const price = parseFloat(item?.price) || 0
      const quantity = parseInt(item?.quantity) || 0
      return price * quantity
    }

    const subtotal = order.items.reduce((acc, item) => acc + calculateItemTotal(item), 0)
    const shipping = parseFloat(order.shipping) || 0
    const tax = parseFloat(order.tax) || 0
    const total = parseFloat(order.amount) || subtotal + shipping + tax

    return { subtotal, shipping, tax, total, calculateItemTotal }
  }, [order])

  // Tracking number
  const trackingNumber = useMemo(
    () => order?.trackingNumber || generateTrackingNumber(order?.orderId || order?._id),
    [order]
  )

  // Print handler
  const handlePrint = useReactToPrint({
    content: useCallback(
      () =>
        printType === PRINT_TYPES.INVOICE ? invoicePrintRef.current : shippingLabelRef.current,
      [printType]
    ),
    documentTitle: `${printType === PRINT_TYPES.INVOICE ? 'Facture' : 'Étiquette'}-${order?.orderId || 'Document'}`,
    onBeforeGetContent: useCallback(() => {
      setIsProcessing(true)
      return Promise.resolve()
    }, []),
    onAfterPrint: useCallback(() => {
      setIsProcessing(false)
      console.log('Impression terminée')
    }, []),
    onPrintError: useCallback((errorLocation, error) => {
      setIsProcessing(false)
      console.error("Erreur d'impression:", errorLocation, error)
    }, []),
  })

  if (!isOpen) return null

  if (!validation.isValid) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-lg max-w-md w-full p-6">
            <ErrorDisplay errors={validation.errors} onClose={onClose} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg max-w-5xl w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Documents d'impression</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="h-5 w-5" />
                {isProcessing ? 'Impression...' : 'Imprimer'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Document Type Selector */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={() => setPrintType(PRINT_TYPES.INVOICE)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  printType === PRINT_TYPES.INVOICE
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-5 w-5" />
                Facture
              </button>
              <button
                onClick={() => setPrintType(PRINT_TYPES.SHIPPING)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  printType === PRINT_TYPES.SHIPPING
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package className="h-5 w-5" />
                Étiquette de livraison
              </button>
            </div>
          </div>

          {/* Print Preview */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className={printType === PRINT_TYPES.INVOICE ? 'block' : 'hidden'}>
              <div ref={invoicePrintRef}>
                <InvoiceTemplate
                  order={order}
                  trackingNumber={trackingNumber}
                  calculations={calculations}
                />
              </div>
            </div>

            <div className={printType === PRINT_TYPES.SHIPPING ? 'block' : 'hidden'}>
              <div ref={shippingLabelRef}>
                <ShippingLabelTemplate order={order} trackingNumber={trackingNumber} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintOrderModal
