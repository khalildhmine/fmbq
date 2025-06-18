// 'use client'

// import React, { useRef, useState } from 'react'
// import { X, Printer, Package, FileText } from 'lucide-react'
// import { useReactToPrint } from 'react-to-print'
// import QRCode from 'qrcode.react'

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
//   const trackingNumber = order.trackingNumber || `TN${order.orderId.replace(/[^0-9]/g, '')}`

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
//                   <p className="text-gray-600">Order #: {order.orderId}</p>
//                   <p className="text-gray-600">
//                     Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
//                   </p>
//                   <p className="text-gray-600">Tracking #: {trackingNumber}</p>
//                 </div>
//               </div>

//               {/* Customer Info */}
//               <div className="mb-8">
//                 <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
//                 <p className="text-gray-700">{order.customer}</p>
//                 <p className="text-gray-600">{order.shippingAddress?.street}</p>
//                 <p className="text-gray-600">
//                   {order.shippingAddress?.city}, {order.shippingAddress?.state}
//                 </p>
//                 <p className="text-gray-600">{order.shippingAddress?.country}</p>
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
//                       <td className="py-3 text-gray-700">{item.name}</td>
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
//                     <QRCode value={order.orderId} size={64} />
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
//                   <p className="font-bold">{order.customer}</p>
//                   <p>{order.shippingAddress?.street}</p>
//                   <p>
//                     {order.shippingAddress?.city}, {order.shippingAddress?.state}
//                   </p>
//                   <p>{order.shippingAddress?.country}</p>
//                   <p>Phone: {order.mobile || 'N/A'}</p>
//                 </div>
//               </div>

//               {/* Order Details */}
//               <div className="mb-6">
//                 <p>
//                   <strong>Order ID:</strong> {order.orderId}
//                 </p>
//                 <p>
//                   <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('fr-FR')}
//                 </p>
//                 <p>
//                   <strong>Package Weight:</strong> {order.weight || 'N/A'}
//                 </p>
//               </div>

//               {/* QR Code */}
//               <div className="text-center">
//                 <QRCode value={`${order.orderId}-${trackingNumber}`} size={120} />
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

import React, { useRef, useState } from 'react'
import { X, Printer, Package, FileText } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

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

const formatDate = dateInput => {
  if (!dateInput) return 'N/A'

  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return 'N/A'

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'N/A'
  }
}

// Simple QR Code component replacement
const SimpleQRCode = ({ value, size = 64 }) => {
  return (
    <div
      className="bg-gray-900 text-white flex items-center justify-center font-mono text-xs"
      style={{
        width: size,
        height: size,
        fontSize: size < 100 ? '8px' : '10px',
      }}
    >
      {value.slice(0, 8)}
    </div>
  )
}

const PrintOrderModal = ({ isOpen, onClose, order }) => {
  const [printType, setPrintType] = useState('invoice')
  const invoicePrintRef = useRef(null)
  const shippingLabelRef = useRef(null)

  const handlePrintContent = () => {
    return printType === 'invoice' ? invoicePrintRef.current : shippingLabelRef.current
  }

  const handlePrint = useReactToPrint({
    content: handlePrintContent,
    documentTitle: `${printType === 'invoice' ? 'Invoice' : 'Shipping-Label'}-${order?.orderId || 'Details'}`,
    onAfterPrint: () => {
      console.log('Print completed')
    },
  })

  if (!order || !isOpen) return null

  // Calculate totals safely
  const calculateItemTotal = item => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return price * quantity
  }

  const subtotal = order.items?.reduce((acc, item) => acc + calculateItemTotal(item), 0) || 0
  const shipping = parseFloat(order.shipping) || 0
  const total = parseFloat(order.amount) || subtotal + shipping

  // Generate tracking number if not exists
  const trackingNumber =
    order.trackingNumber ||
    `TN${order.orderId?.replace(/[^0-9]/g, '') || Math.random().toString().slice(2, 8)}`

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
                  <p className="text-gray-600">Order #: {order.orderId || 'N/A'}</p>
                  <p className="text-gray-600">Date: {formatDate(order.createdAt || order.date)}</p>
                  <p className="text-gray-600">Tracking #: {trackingNumber}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-8">
                <h3 className="text-gray-800 font-semibold mb-2">Bill To:</h3>
                <p className="text-gray-700">{order.customer || 'N/A'}</p>
                <p className="text-gray-600">{order.shippingAddress?.street || 'N/A'}</p>
                <p className="text-gray-600">
                  {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
                </p>
                <p className="text-gray-600">{order.shippingAddress?.country || 'N/A'}</p>
                <p className="text-gray-600">Phone: {order.mobile || 'N/A'}</p>
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
                  {order.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 text-gray-700">{item.name || 'N/A'}</td>
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
                    <p className="text-gray-600">Payment Method: {order.paymentMethod || 'N/A'}</p>
                    <p className="text-gray-600">Payment Status: {order.paymentStatus || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <SimpleQRCode value={order.orderId || 'ORDER'} size={64} />
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
                    {trackingNumber}
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
                  <p className="font-bold">{order.customer || 'N/A'}</p>
                  <p>{order.shippingAddress?.street || 'N/A'}</p>
                  <p>
                    {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
                  </p>
                  <p>{order.shippingAddress?.country || 'N/A'}</p>
                  <p>Phone: {order.mobile || 'N/A'}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-6">
                <p>
                  <strong>Order ID:</strong> {order.orderId || 'N/A'}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(order.createdAt || order.date)}
                </p>
                <p>
                  <strong>Package Weight:</strong> {order.weight || 'N/A'}
                </p>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <SimpleQRCode value={`${order.orderId || 'ORDER'}-${trackingNumber}`} size={120} />
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
