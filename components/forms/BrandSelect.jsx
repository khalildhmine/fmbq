'use client'

import React from 'react'
import { useGetBrandsQuery } from '@/store/services/brand.service'

const BrandSelect = ({ value, onChange, error, required }) => {
  const {
    data: brands,
    isLoading,
    isError,
  } = useGetBrandsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>Failed to load brands. Please try again.</p>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brand {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={onChange}
        className={`w-full border rounded-md p-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
        required={required}
      >
        <option value="">Select Brand</option>
        {brands?.map(brand => (
          <option key={brand._id} value={brand._id}>
            {brand.name} {brand.featured && '⭐'}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default BrandSelect
