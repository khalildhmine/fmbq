'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  Plus,
  Search,
  ChevronDown,
  Filter,
  X,
  Tag,
  Package,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from '@/store/services'

// Import static components
import PageContainer from '@/components/common/PageContainer'
import { useDisclosure } from 'hooks'
import { useTitle } from '@/hooks'

// Dynamically import client components
const HandleResponse = dynamic(() => import('@/components/common/HandleResponse'))
const ConfirmDeleteModal = dynamic(() => import('@/components/modals/ConfirmDeleteModal'))
const ProductImage = dynamic(() => import('@/components/common/ProductImage'))
const ProductsTable = dynamic(() => import('@/components/admin/ProductsTable.jsx'))
const DashboardLayout = dynamic(() => import('@/components/Layouts/DashboardLayout'))

const ProductsContent = () => {
  useTitle('Products Management')

  const { push } = useRouter()
  const searchParams = useSearchParams()
  const page = searchParams?.get('page') ? +searchParams.get('page') : 1
  const category = searchParams?.get('category') ?? ''
  const search = searchParams?.get('search') ?? ''

  const changeRoute = useChangeRoute()

  // States
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([]) // Start with an empty array
  const [deleteInfo, setDeleteInfo] = useState({ id: '' })
  const [searchValue, setSearchValue] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [visiblePages, setVisiblePages] = useState([])

  // Modal handlers
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  // Get Categories Query
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const categories = categoriesData?.data?.categories || []

  // Get Products Query
  const { data, isFetching, refetch, isSuccess, isError, error } = useGetProductsQuery(
    {
      page,
      category,
      search,
      admin: true,
      limit: 20,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    }
  )

  // Delete Product Mutation
  const [
    deleteProduct,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteProductMutation()

  // Direct fetch function (for emergency refresh)
  const directFetchProducts = async () => {
    setLoading(true)
    console.log('🔄 EMERGENCY REFRESH: Starting direct API fetch...')

    try {
      // First attempt - try the standard products endpoint
      let res = await fetch('/api/products?limit=100')
      console.log('📡 API Response Status:', res.status)

      if (!res.ok) {
        console.error('❌ API Error:', res.status, res.statusText)

        // Second attempt - try alternative endpoint if available
        console.log('Trying alternative product endpoint...')
        res = await fetch('/api/admin/products?limit=100')

        if (!res.ok) {
          toast.error(`Failed to fetch products: ${res.statusText}`)
          setLoading(false)
          return
        }
      }

      const data = await res.json()
      console.log('📊 API Response:', data)

      // Log detailed information about the response structure
      console.log('API Response Data Structure:', {
        hasProducts: !!data.products,
        productsType: typeof data.products,
        isArray: Array.isArray(data.products),
        count: data.products?.length || 0,
        hasDataField: !!data.data,
        dataFieldType: typeof data.data,
        dataProducts: !!data.data?.products,
        firstLevel: Object.keys(data),
        secondLevel: data.data ? Object.keys(data.data) : [],
      })

      // Try different paths to find the products array
      let productsArray = null

      if (data.products && Array.isArray(data.products)) {
        console.log('✅ Found products at data.products')
        productsArray = data.products
      } else if (data.data && Array.isArray(data.data.products)) {
        console.log('✅ Found products at data.data.products')
        productsArray = data.data.products
      } else if (data.data && Array.isArray(data.data)) {
        console.log('✅ Found products at data.data (array)')
        productsArray = data.data
      }

      if (productsArray && productsArray.length > 0) {
        console.log(`✅ Processing ${productsArray.length} products`)
        formatProductsData(productsArray)
        toast.success(`Found ${productsArray.length} products`)
      } else {
        // One more attempt - try to find any array in the response that looks like products
        const findProductsInObject = obj => {
          if (!obj || typeof obj !== 'object') return null

          for (const key in obj) {
            if (Array.isArray(obj[key]) && obj[key].length > 0) {
              // Check if the array items look like products (have _id or id fields)
              if (obj[key][0] && (obj[key][0]._id || obj[key][0].id)) {
                console.log(`✅ Found products at ${key}`)
                return obj[key]
              }
            } else if (typeof obj[key] === 'object') {
              const nestedResult = findProductsInObject(obj[key])
              if (nestedResult) return nestedResult
            }
          }
          return null
        }

        const foundProducts = findProductsInObject(data)
        if (foundProducts) {
          formatProductsData(foundProducts)
          toast.success(`Found ${foundProducts.length} products in nested structure`)
        } else {
          // Last resort: try fetching directly from MongoDB collection via custom endpoint
          console.log('Attempting last resort direct fetch...')
          try {
            const directRes = await fetch('/api/admin/mongodb/products?limit=100')
            if (directRes.ok) {
              const directData = await directRes.json()
              if (
                directData.products &&
                Array.isArray(directData.products) &&
                directData.products.length > 0
              ) {
                formatProductsData(directData.products)
                toast.success(`Found ${directData.products.length} products directly from MongoDB`)
                return
              }
            }
          } catch (e) {
            console.error('Last resort fetch failed:', e)
          }

          console.error('❌ No products found in API response:', data)
          toast.error('No products found in the response')
          setProducts([])
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('❌ FETCH ERROR:', error)
      toast.error(`Error fetching products: ${error.message}`)
      setProducts([])
      setLoading(false)
    }
  }

  // Format products data for display
  const formatProductsData = productsData => {
    console.log('🔍 FORMAT FUNCTION CALLED with data:', {
      dataType: typeof productsData,
      isArray: Array.isArray(productsData),
      length: productsData?.length || 0,
      dataKeys: productsData ? Object.keys(productsData) : [],
    })

    if (!productsData || !Array.isArray(productsData)) {
      console.error('❌ INVALID PRODUCTS DATA:', JSON.stringify(productsData))
      setProducts([])
      setLoading(false)
      return
    }

    // If we have products, log the first one to see its structure
    if (productsData.length > 0) {
      console.log('First product structure:', JSON.stringify(productsData[0], null, 2))
    }

    // Log each product received from API
    console.log('📦 RAW PRODUCTS FROM API:')
    productsData.forEach((product, index) => {
      console.log(`  Product ${index + 1}:`, {
        id: product._id,
        title: product.title || product.name,
        price: product.price,
        brand: product.brand || 'No Brand',
        images: Array.isArray(product.images) ? product.images.length : 'none',
        firstImage: product.images?.[0] || 'none',
      })
    })

    const formattedProducts = productsData.map(product => {
      // Process images
      const allImages = []
      if (product.mainImage) allImages.push({ url: product.mainImage })
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (typeof img === 'string') allImages.push({ url: img })
          else if (img.url) allImages.push(img)
        })
      }

      // Get thumbnail
      let thumbnail = product.mainImage || product.images?.[0]?.url || allImages[0]?.url

      // Validate thumbnail URL
      if (
        !thumbnail ||
        thumbnail === 'none' ||
        thumbnail.includes('images.puma.com') ||
        thumbnail.includes('example.com') ||
        (!thumbnail.startsWith('http') &&
          !thumbnail.startsWith('/') &&
          !thumbnail.startsWith('data:'))
      ) {
        thumbnail = '/placeholder.svg'
      }

      // Process brand data
      let brandDisplay = 'Unknown Brand'
      if (product.brand) {
        if (typeof product.brand === 'object') {
          brandDisplay = product.brand.name || 'Unknown Brand'
        } else if (typeof product.brand === 'string') {
          brandDisplay = product.brand
        }
      }

      return {
        _id: product._id,
        title: product.title || product.name || 'Unnamed Product',
        price: product.price || 0,
        inStock: product.inStock || product.quantity || 0,
        sold: product.sold || 0,
        images: allImages,
        brand: brandDisplay,
        category: product.category?._id || product.categoryId || '',
        categoryName: product.category?.name || 'Uncategorized',
        description: product.description || '',
        thumbnail: thumbnail,
        formattedPrice: `${product.price || 0} MRU`,
        stockStatus:
          product.inStock > 10 ? 'In Stock' : product.inStock > 0 ? 'Low Stock' : 'Out of Stock',
        stockStatusClass:
          product.inStock > 10
            ? 'text-green-600 bg-green-50 border-green-100'
            : product.inStock > 0
              ? 'text-yellow-600 bg-yellow-50 border-yellow-100'
              : 'text-red-600 bg-red-50 border-red-100',
      }
    })

    console.log(`✅ FORMATTED ${formattedProducts.length} PRODUCTS SUCCESSFULLY`)
    console.log('Final products array length:', formattedProducts.length)
    console.log('Setting products state with formatted data')

    setProducts(formattedProducts)
    setLoading(false)
  }

  // Log data on component mount
  useEffect(() => {
    console.log('Products page mounted with query params:', { page, category, search })
    console.log('Redux API state:', { isSuccess, isError, isFetching, hasData: !!data })

    // Always run direct fetch on mount to ensure products load
    // Add a slight delay to avoid race conditions with other useEffects
    const fetchTimer = setTimeout(() => {
      console.log('Starting immediate data fetch...')
      directFetchProducts()
    }, 100)

    return () => clearTimeout(fetchTimer)
  }, []) // Empty dependency array ensures this only runs once on mount

  // Initialize with data when available
  useEffect(() => {
    console.log('Data update effect triggered:', {
      isSuccess,
      hasData: !!data,
      productsExist: data?.data?.products?.length > 0,
      productsCount: data?.data?.products?.length || 0,
    })

    if (isSuccess && data) {
      console.log('Redux API response:', data)

      // Check for products in different locations within the data structure
      let productsArray = null

      if (data.data?.products && Array.isArray(data.data.products)) {
        console.log('Found products in data.data.products')
        productsArray = data.data.products
      } else if (data.products && Array.isArray(data.products)) {
        console.log('Found products in data.products')
        productsArray = data.products
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Found products in data.data array')
        productsArray = data.data
      }

      // If we still don't have products, try a recursive search
      if (!productsArray) {
        const findProductsInObject = obj => {
          if (!obj || typeof obj !== 'object') return null

          for (const key in obj) {
            if (Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0]?._id) {
              console.log(`Found products at ${key}`)
              return obj[key]
            } else if (typeof obj[key] === 'object') {
              const nestedResult = findProductsInObject(obj[key])
              if (nestedResult) return nestedResult
            }
          }
          return null
        }

        productsArray = findProductsInObject(data)
        if (productsArray) {
          console.log(`Found ${productsArray.length} products in nested structure`)
        }
      }

      if (productsArray && productsArray.length > 0) {
        // Only process data if we don't already have products loaded
        if (products.length === 0) {
          console.log(`Processing ${productsArray.length} products from Redux API`)

          // Format the products data
          formatProductsData(productsArray)

          // Calculate pagination
          const totalProducts =
            data.data?.pagination?.totalItems || data.pagination?.totalItems || productsArray.length
          const totalPages = data.data?.pagination?.totalPages || data.pagination?.totalPages || 1

          console.log('Pagination info:', { totalProducts, totalPages, currentPage: page })

          // Calculate visible page numbers
          let newVisiblePages = []
          if (totalPages <= 5) {
            newVisiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
          } else if (page <= 3) {
            newVisiblePages = [1, 2, 3, 4, 5]
          } else if (page >= totalPages - 2) {
            newVisiblePages = [
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
              totalPages,
            ]
          } else {
            newVisiblePages = [page - 2, page - 1, page, page + 1, page + 2]
          }

          setVisiblePages(newVisiblePages)
        }
        setLoading(false)
      } else {
        console.warn('No products found in the Redux API response')
        // Try direct fetch as a fallback
        directFetchProducts()
      }
    } else if (isSuccess && !data) {
      console.warn('Redux API returned success but no data')
      directFetchProducts()
    }
  }, [data, isSuccess, page, products.length])

  // Try fallback fetch if API fails
  useEffect(() => {
    if (isError) {
      console.warn('API fetch failed, attempting fallback fetch...')
      directFetchProducts()
    } else if (!isFetching) {
      setLoading(false) // Stop loading if no fetch is happening
    }
  }, [isError, isFetching])

  // Delete handlers
  const handleDelete = id => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteProduct({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
    refetch()
  }

  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  // Handle search submission
  const handleSearch = () => {
    changeRoute({ search: searchValue, page: 1 })
  }

  // Handle category filter change
  const handleCategoryChange = e => {
    const newCategory = e.target.value
    setSelectedCategory(newCategory)
    changeRoute({ category: newCategory, page: 1 })
  }

  // Clear filters
  const clearFilters = () => {
    setSearchValue('')
    setSelectedCategory('')
    changeRoute({ category: '', search: '', page: 1 })
  }

  // Handle pagination
  const goToPage = newPage => {
    changeRoute({ page: newPage })
  }

  const hasActiveFilters = search || category

  // Monitor product state changes
  useEffect(() => {
    console.log('Products state updated:', {
      productsCount: products.length,
      loading,
      firstProduct: products[0] ? `${products[0].title} (${products[0]._id})` : 'none',
    })
  }, [products, loading])

  return (
    <>
      <ConfirmDeleteModal
        title="Delete Product"
        isLoading={isLoadingDelete}
        isShow={isShowConfirmDeleteModal}
        onClose={confirmDeleteModalHandlers.close}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />

      {/* Handle Delete Response */}
      {(isSuccessDelete || isErrorDelete) && (
        <HandleResponse
          isError={isErrorDelete}
          isSuccess={isSuccessDelete}
          error={errorDelete?.data?.message}
          message={dataDelete?.message}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <PageContainer>
          <section className="p-4 lg:p-6 space-y-6" id="_adminProducts">
            {/* Header with add product button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-500 mt-1">Manage your inventory</p>
              </div>

              <div className="flex gap-3">
                {/* Emergency refresh button */}
                <button
                  onClick={directFetchProducts}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Emergency Refresh
                </button>

                <Link
                  href="/admin/products/create"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Link>
              </div>
            </div>

            {/* Search and filter bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="bg-gray-50 w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                {/* Category filter */}
                <div className="relative md:w-60">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="bg-gray-50 appearance-none w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearch}
                  className="py-2.5 px-5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Search
                </button>

                {/* Clear filters button (only shown when filters are active) */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Show error with retry button */}
            {isError && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-red-600 h-6 w-6" />
                  <h3 className="text-lg font-medium text-red-600">Error Loading Products</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  {error?.data?.message ||
                    error?.message ||
                    'An error occurred while loading products'}
                </p>
                <button
                  onClick={refetch}
                  className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <motion.div
                  key={product._id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
                    product.isMock ? 'opacity-40' : ''
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      className="w-full h-full object-cover object-center transition-transform hover:scale-105"
                      src={product.thumbnail || '/placeholder.svg'}
                      alt={product.title}
                      onError={e => {
                        console.log(`Image error for product ${product._id}:`, e.target.src)
                        // Prevent infinite error loops
                        if (!e.target.src.includes('placeholder')) {
                          e.target.src = '/placeholder.svg'
                        }
                      }}
                    />

                    {/* Image count badge if product has multiple images */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {product.images.length} images
                      </div>
                    )}

                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                    </div>

                    {/* Brand Badge */}
                    <div className="flex items-center gap-1 mb-2">
                      <Tag size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {typeof product.brand === 'object'
                          ? product.brand.name || 'Unknown Brand'
                          : typeof product.brand === 'string'
                            ? product.brand
                            : 'Unknown Brand'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-bold text-lg text-black">
                        {product.formattedPrice || `${product.price} MRU`}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm line-through text-gray-400">
                          {Math.round(product.price * (1 + product.discount / 100))} MRU
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Stock Badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          product.stockStatusClass || 'text-gray-700 bg-gray-50 border-gray-100'
                        }`}
                      >
                        {product.stockStatus ||
                          (product.inStock > 0 ? `In Stock (${product.inStock})` : 'Out of Stock')}
                      </span>

                      {/* Category Badge */}
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {product.categoryName}
                      </span>

                      {/* Sold Badge */}
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        Sold: {product.sold}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="flex-1 py-2 text-center text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Zap size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 py-2 text-center text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                        disabled={product.isMock}
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Loading overlay */}
            {(loading || isFetching) && (
              <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-t-black rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-900 font-medium">Loading products...</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !isFetching && products.length === 0 && (
              <div className="bg-white p-10 rounded-xl border border-gray-100 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="text-gray-800 text-lg font-medium">No products found</div>
                <p className="text-gray-500 mt-2 mb-6">
                  No products match your current filters or you haven't added any products yet.
                </p>
                <Link
                  href="/admin/products/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Link>
              </div>
            )}

            {/* Pagination */}
            {visiblePages.length > 1 && !loading && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    &laquo;
                  </button>

                  {visiblePages.map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        pageNum === page
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!data?.data?.pagination || page === data.data.pagination.totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </section>
        </PageContainer>
      </motion.div>
    </>
  )
}

const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  )
}

export default ProductsPage
