'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Percent, DollarSign, Tag, InfoIcon, Users } from 'lucide-react'

export default function CreateCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    discount: 10,
    expiresAt: getDefaultExpiryDate(),
    isActive: true,
    minAmount: 0,
    maxUses: null,
    description: '',
    isLimitedToFirstTimeUsers: false,
  })

  // Get default expiry date (1 month from now)
  function getDefaultExpiryDate() {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
  }

  // Handle form input changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? ''
              : Number(value)
            : value,
    }))
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.code) throw new Error('Coupon code is required')
      if (!formData.discount || formData.discount <= 0 || formData.discount > 100) {
        throw new Error('Discount must be between 1 and 100')
      }
      if (!formData.expiresAt) throw new Error('Expiry date is required')

      // Format maxUses to null if empty
      const submissionData = {
        ...formData,
        maxUses: formData.maxUses === '' ? null : formData.maxUses,
      }

      // Send API request
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coupon')
      }

      // Redirect back to coupons list on success
      router.push('/admin/coupons')
    } catch (err) {
      console.error('Error creating coupon:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-6 py-8 mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/coupons"
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Coupons
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Coupon</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new discount coupon for your customers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
            <InfoIcon className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Code */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <Tag className="w-4 h-4 mr-1" /> Coupon Code
            </label>
            <input
              type="text"
              name="code"
              id="code"
              required
              placeholder="e.g. SUMMER25"
              value={formData.code}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Code will be automatically converted to uppercase.
            </p>
          </div>

          {/* Discount */}
          <div>
            <label
              htmlFor="discount"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <Percent className="w-4 h-4 mr-1" /> Discount Percentage
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                name="discount"
                id="discount"
                required
                min="1"
                max="100"
                value={formData.discount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-12"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiry Date */}
            <div>
              <label
                htmlFor="expiresAt"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-1" /> Expiry Date
              </label>
              <input
                type="date"
                name="expiresAt"
                id="expiresAt"
                required
                value={formData.expiresAt}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Minimum Purchase */}
            <div>
              <label
                htmlFor="minAmount"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <DollarSign className="w-4 h-4 mr-1" /> Min. Purchase (MRU)
              </label>
              <input
                type="number"
                name="minAmount"
                id="minAmount"
                min="0"
                value={formData.minAmount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Set to 0 for no minimum purchase requirement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Uses */}
            <div>
              <label
                htmlFor="maxUses"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <Users className="w-4 h-4 mr-1" /> Max Usage Limit
              </label>
              <input
                type="number"
                name="maxUses"
                id="maxUses"
                min="0"
                value={formData.maxUses === null ? '' : formData.maxUses}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited uses.</p>
            </div>

            {/* Active Status */}
            <div>
              <div className="flex items-center h-full pt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Coupon is active and can be used
                </label>
              </div>
            </div>
          </div>

          {/* First-time users only */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isLimitedToFirstTimeUsers"
              id="isLimitedToFirstTimeUsers"
              checked={formData.isLimitedToFirstTimeUsers}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isLimitedToFirstTimeUsers" className="ml-2 block text-sm text-gray-700">
              Limited to first-time customers only
            </label>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter any additional details about this coupon"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/coupons')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
