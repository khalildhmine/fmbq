'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/admin/DashboardHeader'
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from '@/components/admin/ConfirmationModal'

export default function MaisonAdrarPage() {
  const router = useRouter()
  const [perfumes, setPerfumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [perfumeToDelete, setPerfumeToDelete] = useState(null)

  const fetchPerfumes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (selectedType) {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/admin/maison-adrar?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setPerfumes(result.data.perfumes)
        setTotalPages(result.data.pagination.totalPages)
      } else {
        setError(result.message || 'Failed to fetch perfumes')
        toast.error(result.message || 'Failed to fetch perfumes')
      }
    } catch (error) {
      console.error('Error fetching perfumes:', error)
      setError('Failed to fetch perfumes')
      toast.error('Failed to fetch perfumes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerfumes()
  }, [currentPage, sortBy, sortOrder, selectedType])

  const handleSearch = e => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPerfumes()
  }

  const handleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleDelete = async () => {
    if (!perfumeToDelete) return

    try {
      const response = await fetch(`/api/admin/maison-adrar/${perfumeToDelete._id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Perfume deleted successfully')
        fetchPerfumes()
      } else {
        toast.error(result.message || 'Failed to delete perfume')
      }
    } catch (error) {
      console.error('Error deleting perfume:', error)
      toast.error('Failed to delete perfume')
    } finally {
      setShowDeleteModal(false)
      setPerfumeToDelete(null)
    }
  }

  const openDeleteModal = perfume => {
    setPerfumeToDelete(perfume)
    setShowDeleteModal(true)
  }

  const renderSortIcon = field => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline ml-1" />
    )
  }

  const formatPrice = price => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MRU',
    }).format(price)
  }

  const getStockStatusClass = stock => {
    if (stock <= 0) return 'bg-red-100 text-red-800'
    if (stock < 5) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="w-full">
      <DashboardHeader
        title="Maison Adrar Collection"
        description="Manage your perfume collection"
      />

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <Link
          href="/admin/maison-adrar/create"
          className="bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add New Perfume
        </Link>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search perfumes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 hover:bg-gray-200"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              </button>
            </form>
          </div>

          <select
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value)
              setCurrentPage(1)
            }}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="body">Body</option>
            <option value="house">House</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Perfumes Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading perfumes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Image
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    Price {renderSortIcon('price')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    Type {renderSortIcon('type')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('inStock')}
                  >
                    Stock {renderSortIcon('inStock')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {perfumes.length > 0 ? (
                  perfumes.map(perfume => (
                    <tr key={perfume._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-12 w-12 relative">
                          <Image
                            src={perfume.mainImage || '/placeholder.png'}
                            alt={perfume.name}
                            fill
                            className="rounded-md object-cover"
                            onError={e => {
                              e.target.onerror = null
                              e.target.src = '/placeholder.png'
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{perfume.name}</div>
                        <div className="text-sm text-gray-500">
                          {perfume.concentration} - {perfume.volume}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatPrice(perfume.price)}
                        </div>
                        {perfume.discount > 0 && (
                          <div className="text-xs text-red-600">-{perfume.discount}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {perfume.type.charAt(0).toUpperCase() + perfume.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(
                            perfume.inStock
                          )}`}
                        >
                          {perfume.inStock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/maison-adrar/edit/${perfume._id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(perfume)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No perfumes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Perfume"
        message={`Are you sure you want to delete ${perfumeToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
