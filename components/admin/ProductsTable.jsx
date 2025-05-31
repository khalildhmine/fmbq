'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// Status colors for in-stock indicators
const stockStatusColors = {
  inStock: 'bg-green-900/30 text-green-400',
  lowStock: 'bg-yellow-900/30 text-yellow-400',
  outOfStock: 'bg-red-900/30 text-red-400',
}

export default function ProductsTable({
  data = [],
  loading = false,
  pageSize = 8,
  onDelete = () => {},
  categories = [],
}) {
  const [products, setProducts] = useState([])
  const [sortField, setSortField] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Initialize with default or passed data
  useEffect(() => {
    if (data.length > 0) {
      setProducts(data)
    } else {
      // Default empty state - no sample data as this will be populated from API
      setProducts([])
    }
  }, [data])

  // Handle sorting
  const handleSort = field => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon
  const getSortIcon = field => {
    if (sortField !== field) return '⇕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // Determine stock status color
  const getStockStatusColor = inStock => {
    if (inStock <= 0) return stockStatusColors.outOfStock
    if (inStock < 10) return stockStatusColors.lowStock
    return stockStatusColors.inStock
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesText =
        filter === '' || product.title.toLowerCase().includes(filter.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter

      return matchesText && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0

      // Handle numeric fields differently
      if (['price', 'inStock', 'sold'].includes(sortField)) {
        comparison = Number(a[sortField]) - Number(b[sortField])
      } else {
        // String comparison
        if (a[sortField] < b[sortField]) {
          comparison = -1
        } else if (a[sortField] > b[sortField]) {
          comparison = 1
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handle delete confirmation
  const handleDeleteClick = product => {
    setConfirmDelete(product)
  }

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      onDelete(confirmDelete._id)
      setConfirmDelete(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
  }

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  // Get category name by ID
  const getCategoryName = categoryId => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : 'Unknown'
  }

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>

            <Link
              href="/admin/products/create"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
            >
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/30">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('_id')}
              >
                ID <span className="ml-1">{getSortIcon('_id')}</span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('title')}
              >
                Name <span className="ml-1">{getSortIcon('title')}</span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('price')}
              >
                Price <span className="ml-1">{getSortIcon('price')}</span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('sold')}
              >
                Sold <span className="ml-1">{getSortIcon('sold')}</span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort('inStock')}
              >
                Stock <span className="ml-1">{getSortIcon('inStock')}</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  <div className="flex justify-center">
                    <div className="w-10 h-10 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="mt-2">Loading products...</div>
                </td>
              </tr>
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No products found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product, index) => (
                <motion.tr
                  key={product._id}
                  className="hover:bg-gray-700/50 transition-colors"
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                >
                  <td className="px-4 py-3 text-sm text-gray-300">{product._id}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 flex items-center">
                    {product.images && product.images.length > 0 && (
                      <div className="flex-shrink-0 h-10 w-10 mr-2 bg-gray-800 rounded-md overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                          onError={e => {
                            e.target.src = '/product-placeholder.jpg' // Fallback image
                          }}
                        />
                      </div>
                    )}
                    <span className="truncate max-w-xs">{product.title}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">MRU {product.price}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{product.sold}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(
                        product.inStock
                      )}`}
                    >
                      {product.inStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/admin/(dashboard-layout)/products/edit/${product._id}`}
                        className="p-1 rounded-md bg-blue-800/30 hover:bg-blue-700/50 text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        className="p-1 rounded-md bg-red-800/30 hover:bg-red-700/50 text-red-400 transition-colors"
                        title="Delete"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/80 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-2 sm:mb-0">
            Showing {Math.min(filteredProducts.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredProducts.length, currentPage * pageSize)} of {filteredProducts.length}{' '}
            products
          </div>

          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors'
              }`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calculate the page numbers to show based on current page
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors'
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors'
              }`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-2xl border border-gray-700"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Delete Product</h3>
              <p className="text-gray-300 mb-2">Are you sure you want to delete this product?</p>
              <p className="text-gray-300 mb-6 font-semibold">{confirmDelete.title}</p>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  onClick={confirmDeleteAction}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
