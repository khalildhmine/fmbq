'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  FaBarcode,
  FaCreditCard,
  FaMoneyBillWave,
  FaPrint,
  FaTrash,
  FaSearch,
  FaPlus,
  FaMinus,
  FaCheck,
  FaShoppingCart,
  FaUser,
  FaStore,
  FaQrcode,
  FaTimes,
} from 'react-icons/fa'

const POSPage = () => {
  const [scannedCode, setScannedCode] = useState('')
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const scannerRef = useRef(null)
  const searchTimeout = useRef(null)

  // Auto-focus scanner input
  useEffect(() => {
    if (scannerRef.current) {
      scannerRef.current.focus()
    }
  }, [])

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch products from API
  const fetchProducts = async (search = '') => {
    setLoadingProducts(true)
    try {
      const response = await fetch(`/api/pos/products?search=${search}&limit=100`)
      const data = await response.json()

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products)
      } else {
        console.error('Invalid products data:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  // Handle product search with debounce
  const handleProductSearch = e => {
    const search = e.target.value
    setProductSearch(search)

    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetchProducts(search)
    }, 300)
  }

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const itemTotal = item?.total && typeof item.total === 'number' ? item.total : 0
      return sum + itemTotal
    }, 0)
    setTotal(newTotal)
  }, [cart])

  // Handle scanner input - scan real products from API
  const handleScannerInput = async e => {
    const code = e.target.value
    setScannedCode(code)

    if (code.length > 0) {
      setTimeout(async () => {
        await scanProduct(code)
        setScannedCode('')
        if (scannerRef.current) {
          scannerRef.current.focus()
        }
      }, 100)
    }
  }

  // Scan product from API
  const scanProduct = async productId => {
    try {
      const response = await fetch('/api/pos/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (data.success && data.product) {
        addProductToCart(data.product)
      } else {
        console.error('Product not found:', data.message)
      }
    } catch (error) {
      console.error('Scan error:', error)
    }
  }

  // Add product to cart
  const addProductToCart = product => {
    if (!product || !product._id || !product.name || typeof product.salePrice !== 'number') {
      return
    }

    const existingItem = cart.find(item => item.productId === product._id)

    if (existingItem) {
      if (existingItem.quantity < (product.stock || 0)) {
        setCart(prev =>
          prev.map(item =>
            item.productId === product._id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  total: (item.quantity + 1) * item.price,
                }
              : item
          )
        )
      }
    } else {
      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.salePrice,
        quantity: 1,
        total: product.salePrice,
        category: product.category || 'General',
        brand: product.brand || 'Generic',
      }
      setCart(prev => [...prev, newItem])
    }
  }

  // Update item quantity
  const updateQuantity = (productId, change) => {
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change
          if (newQuantity > 0 && newQuantity <= item.stock) {
            return { ...item, quantity: newQuantity, total: newQuantity * item.price }
          }
        }
        return item
      })
    )
  }

  // Remove item from cart
  const removeItem = productId => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setCustomerInfo({ name: '', phone: '', email: '' })
  }

  // Process checkout with proper API call
  const processCheckout = async () => {
    try {
      if (!cart || cart.length === 0) {
        return
      }

      setIsProcessing(true)

      // Validate cart items
      const validCartItems = cart.filter(item => {
        return (
          item &&
          item.productId &&
          item.name &&
          typeof item.price === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0 &&
          typeof item.total === 'number'
        )
      })

      if (validCartItems.length === 0) {
        console.error('No valid items in cart')
        return
      }

      const checkoutData = {
        items: validCartItems,
        totalAmount: total || 0,
        paymentMethod: paymentMethod || 'cash',
        customerInfo: {
          name: customerInfo?.name || 'Walk-in Customer',
          phone: customerInfo?.phone || '',
          email: customerInfo?.email || '',
        },
        cashierId: 'current-user-id',
        mobile: '0000000000',
      }

      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      const data = await response.json()

      if (data.success && data.order) {
        // Create safe order with proper null checks
        const safeOrder = {
          receiptNumber: data.order?.receiptNumber || `R${Date.now()}`,
          createdAt: data.order?.createdAt || new Date().toISOString(),
          items: Array.isArray(data.order?.items)
            ? data.order.items.map(item => ({
                name: item?.name || 'Unknown Item',
                quantity: item?.quantity || 1,
                price: item?.price || 0,
                total: item?.total || 0,
              }))
            : validCartItems,
          totalAmount:
            typeof data.order?.totalAmount === 'number' ? data.order.totalAmount : total || 0,
          paymentMethod: data.order?.paymentMethod || paymentMethod || 'cash',
          customerInfo: {
            name: data.order?.customerInfo?.name || customerInfo?.name || 'Walk-in Customer',
            phone: data.order?.customerInfo?.phone || customerInfo?.phone || '',
            email: data.order?.customerInfo?.email || customerInfo?.email || '',
          },
        }

        setCurrentOrder(safeOrder)
        setShowReceipt(true)
        setCart([])
        setCustomerInfo({ name: '', phone: '', email: '' })

        // Refresh products after checkout
        fetchProducts()
      } else {
        console.error('Checkout failed:', data.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Print receipt
  const printReceipt = () => {
    if (!currentOrder) return

    const printWindow = window.open('', '_blank')
    const customerName = currentOrder.customerInfo?.name || 'Walk-in Customer'
    const orderItems = currentOrder.items || []
    const orderTotal = currentOrder.totalAmount || 0

    printWindow.document.write(`
      <html>
        <head>
          <title>Reçu</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10mm; 
              margin: 0;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .receipt-info {
              font-size: 11px;
              color: #666;
            }
            .items {
              margin: 15px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              padding: 2px 0;
            }
            .item-details {
              flex: 1;
            }
            .item-price {
              text-align: right;
              min-width: 80px;
            }
            .total-section {
              border-top: 1px solid #000;
              margin-top: 15px;
              padding-top: 10px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 11px;
            }
            .payment-info {
              margin: 10px 0;
              text-align: center;
              background: #f5f5f5;
              padding: 8px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">FORMEN & Boutiqueen</div>
            <div class="receipt-info">Nouakchott, Mauritanie</div>
            <div class="receipt-info">Tél: +222 41 41 26 24</div>
          </div>
          
          <div style="text-align: center; margin: 10px 0;">
            <strong>REÇU N° ${currentOrder.receiptNumber}</strong><br>
            <small>${new Date(currentOrder.createdAt).toLocaleString('fr-FR')}</small>
          </div>

          <div class="payment-info">
            <strong>Client:</strong> ${customerName}<br>
            <strong>Paiement:</strong> ${currentOrder.paymentMethod.toUpperCase()}
          </div>

          <div class="items">
            ${orderItems
              .map(
                item => `
              <div class="item">
                <div class="item-details">
                  ${item.name}<br>
                  <small>${item.quantity} × ${orderTotal.toFixed(0)}MRU</small>
                </div>
                <div class="item-price">${orderTotal.toFixed(0)}MRU</div>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="total-section">
            <div class="total-line">
              <span>Sous-total:</span>
              <span>${orderTotal.toFixed(0)} MRU</span>
            </div>
            <div class="total-line">
              <span>TVA (0%):</span>
              <span>0 MRU</span>
            </div>
            <div class="total-line grand-total">
              <span>TOTAL:</span>
              <span>${orderTotal.toFixed(0)} MRU</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Merci pour votre achat!</strong></p>
            <p>Conservez ce reçu</p>
            <p style="margin-top: 15px; font-size: 10px;">
              ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </body>
      </html>
    `)
    printWindow.print()
  }

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.brand.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded">
                <FaStore className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Point de Vente</h1>
                <p className="text-xs text-gray-500">Système POS Professionnel</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Caissier</p>
                <p className="text-sm font-medium text-gray-900">Admin</p>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <FaUser className="text-gray-600 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="w-3/5 bg-white border-r flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={productSearch}
                onChange={handleProductSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto p-4">
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des produits...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaSearch className="text-3xl mx-auto mb-3 text-gray-300" />
                <p>Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {products.map(product => (
                  <div
                    key={product._id}
                    onClick={() => addProductToCart(product)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all"
                  >
                    <div className="aspect-square bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <FaBarcode className="text-gray-400 text-lg" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                      {product.name || 'Produit sans nom'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {product.brand || 'Marque inconnue'}
                    </p>
                    <p className="text-base font-bold text-blue-600">
                      {(product.salePrice || 0).toFixed(0)} MRU
                    </p>
                    <p className="text-xs text-gray-500">Stock: {product.stock || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-2/5 flex flex-col">
          {/* Scanner */}
          <div className="bg-white p-4 border-b">
            <div className="flex items-center space-x-2 mb-2">
              <FaQrcode className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Scanner</span>
            </div>
            <input
              ref={scannerRef}
              type="text"
              value={scannedCode}
              onChange={handleScannerInput}
              placeholder="Scanner le code-barres..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Cart */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaShoppingCart />
                <span className="font-medium">Panier ({cart.length})</span>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-blue-100 hover:text-white">
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <FaShoppingCart className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p>Panier vide</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="bg-white rounded-md p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-900 flex-1">
                          {item?.name || 'Article inconnu'}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            <FaMinus />
                          </button>
                          <span className="text-sm w-8 text-center">{item?.quantity || 0}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            <FaPlus />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {(item?.price || 0).toFixed(0)} MRU chacun
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            {(item?.total || 0).toFixed(0)} MRU
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer & Payment */}
            <div className="bg-white border-t p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Client</h3>
                <input
                  type="text"
                  placeholder="Nom du client"
                  value={customerInfo.name}
                  onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mode de Paiement</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: 'Espèces', icon: FaMoneyBillWave },
                    { id: 'bankily', label: 'Bankily', icon: FaCreditCard },
                    { id: 'sedad', label: 'Sedad', icon: FaCreditCard },
                    { id: 'masrvi', label: 'Masrvi', icon: FaCreditCard },
                  ].map(method => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-2 border rounded-md text-xs font-medium flex items-center justify-center space-x-1 ${
                          paymentMethod === method.id
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="text-xs" />
                        <span>{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-100 rounded-md p-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{(total || 0).toFixed(0)} MRU</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={processCheckout}
                disabled={cart.length === 0 || isProcessing}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Traitement...</span>
                  </div>
                ) : (
                  'Valider la Commande'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Commande Validée</h2>
                <p className="text-sm text-gray-600">
                  Reçu #{currentOrder?.receiptNumber || 'N/A'}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-600 font-medium">Client</p>
                  <p className="text-sm font-bold text-gray-900">
                    {currentOrder?.customerInfo?.name || 'Client de passage'}
                  </p>
                </div>

                <div className="border-t pt-3">
                  {(currentOrder?.items || []).map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-sm text-gray-700">
                        {item?.name || 'Article inconnu'} × {item?.quantity || 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {(item?.total || 0).toFixed(0)} MRU
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{(currentOrder?.totalAmount || 0).toFixed(0)} MRU</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    Paiement: {currentOrder?.paymentMethod || 'espèces'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={printReceipt}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FaPrint className="inline mr-1" />
                  Imprimer
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false)
                    setCurrentOrder(null)
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default POSPage
