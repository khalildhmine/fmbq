'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Copy,
} from 'lucide-react'
import Link from 'next/link'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCopiedMessage, setShowCopiedMessage] = useState(null)

  // Fetch coupons data
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/coupons')

        if (!response.ok) {
          throw new Error('Failed to fetch coupons')
        }

        const data = await response.json()
        console.log('API response data:', data) // Debug log

        // Check what type of data we received
        if (data && data.success && Array.isArray(data.data)) {
          setCoupons(data.data)
        } else if (Array.isArray(data)) {
          setCoupons(data)
        } else {
          console.error('Unexpected API response format:', data)
          setCoupons([]) // Set empty array as fallback
        }
      } catch (err) {
        console.error('Error fetching coupons:', err)
        setError(err.message)

        // Fallback data for development/preview
        setCoupons([
          {
            _id: '1',
            code: 'SUMMER25',
            discount: 25,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            minAmount: 100,
            maxUses: 100,
            usedCount: 45,
            createdAt: '2023-06-15T10:30:00Z',
          },
          {
            _id: '2',
            code: 'WELCOME10',
            discount: 10,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            minAmount: 50,
            maxUses: 1000,
            usedCount: 324,
            createdAt: '2023-05-20T08:15:00Z',
          },
          {
            _id: '3',
            code: 'FLASH50',
            discount: 50,
            expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: false,
            minAmount: 150,
            maxUses: 50,
            usedCount: 50,
            createdAt: '2023-04-01T12:00:00Z',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  // Make sure coupons is initialized properly
  useEffect(() => {
    console.log('Current coupons state:', coupons)
  }, [coupons])

  // Handle sorting
  const requestSort = key => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Handle coupon deletion
  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response = await fetch(`/api/coupons/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete coupon')
        }

        // Remove the deleted coupon from state
        setCoupons(coupons.filter(coupon => coupon._id !== id))
      } catch (err) {
        console.error('Error deleting coupon:', err)
        alert('Failed to delete coupon. Please try again.')
      }
    }
  }

  // Handle copying coupon code to clipboard
  const copyToClipboard = code => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setShowCopiedMessage(code)
        setTimeout(() => setShowCopiedMessage(null), 2000)
      })
      .catch(err => {
        console.error('Failed to copy code:', err)
      })
  }

  // Fix the filter and sort logic - wrap the whole thing with defensive coding
  const filteredAndSortedCoupons = useMemo(() => {
    if (!Array.isArray(coupons)) {
      console.error('Coupons is not an array:', coupons)
      return []
    }

    return [...coupons]
      .filter(coupon => {
        if (!coupon || typeof coupon !== 'object') return false

        // Filter by search term (with null checks)
        const matchesSearch =
          coupon.code && typeof coupon.code === 'string'
            ? coupon.code.toLowerCase().includes((searchTerm || '').toLowerCase())
            : false

        // Filter by status (with null checks)
        const matchesStatus =
          selectedStatus === 'all' ||
          (selectedStatus === 'active' && coupon.isActive) ||
          (selectedStatus === 'expired' && !coupon.isActive) ||
          (selectedStatus === 'upcoming' &&
            coupon.expiresAt &&
            new Date(coupon.expiresAt) > new Date())

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortConfig.key === 'code') {
          return sortConfig.direction === 'asc'
            ? a.code.localeCompare(b.code)
            : b.code.localeCompare(a.code)
        } else if (sortConfig.key === 'discount') {
          return sortConfig.direction === 'asc' ? a.discount - b.discount : b.discount - a.discount
        } else if (sortConfig.key === 'expiresAt') {
          return sortConfig.direction === 'asc'
            ? new Date(a.expiresAt) - new Date(b.expiresAt)
            : new Date(b.expiresAt) - new Date(a.expiresAt)
        } else if (sortConfig.key === 'usedCount') {
          return sortConfig.direction === 'asc'
            ? a.usedCount - b.usedCount
            : b.usedCount - a.usedCount
        } else {
          return sortConfig.direction === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt)
        }
      })
  }, [coupons, searchTerm, selectedStatus, sortConfig])

  // Get status badge for a coupon
  const getCouponStatus = coupon => {
    const now = new Date()
    const expiryDate = new Date(coupon.expiresAt)

    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3.5 h-3.5 mr-1 text-gray-500" />
          Inactive
        </span>
      )
    } else if (expiryDate < now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
          Expired
        </span>
      )
    } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-orange-500" />
          Fully Redeemed
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" />
          Active
        </span>
      )
    }
  }

  // Format date
  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="container px-6 py-8 mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage discount coupons for your store</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/coupons/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Coupon
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="mt-6 md:flex md:items-center md:justify-between">
        <div className="relative flex items-center mt-4 md:mt-0 w-full md:w-1/3">
          <Search className="absolute left-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-40"
          />
        </div>

        <div className="flex items-center justify-between mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Coupon table */}
      <div className="mt-6 bg-white rounded-lg overflow-hidden shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading coupons...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-6 text-red-500">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => requestSort('code')}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Coupon Code</span>
                      <ArrowUpDown
                        className={`h-4 w-4 ${
                          sortConfig.key === 'code'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => requestSort('discount')}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Discount</span>
                      <ArrowUpDown
                        className={`h-4 w-4 ${
                          sortConfig.key === 'discount'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => requestSort('expiresAt')}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Expires</span>
                      <ArrowUpDown
                        className={`h-4 w-4 ${
                          sortConfig.key === 'expiresAt'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <button
                      onClick={() => requestSort('usedCount')}
                      className="group flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Usage</span>
                      <ArrowUpDown
                        className={`h-4 w-4 ${
                          sortConfig.key === 'usedCount'
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Min. Purchase
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
                {filteredAndSortedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No coupons found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedCoupons.map(coupon => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-sm font-medium text-gray-900 flex items-center hover:text-indigo-600 transition-colors"
                            >
                              {coupon.code}
                              <Copy className="ml-1.5 h-4 w-4 text-gray-400 hover:text-indigo-500" />
                            </button>
                            {showCopiedMessage === coupon.code && (
                              <span className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                Copied!
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {coupon.discount}% OFF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(coupon.expiresAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getCouponStatus(coupon)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount}
                          {coupon.maxUses && ` / ${coupon.maxUses}`}
                        </div>
                        {coupon.maxUses && (
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (coupon.usedCount / coupon.maxUses) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.minAmount ? `${coupon.minAmount} MRU` : 'None'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/coupons/${coupon._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
