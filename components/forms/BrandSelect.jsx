'use client'

import React from 'react'
import { Controller } from 'react-hook-form'
import { useGetBrandsQuery } from '@/store/services/brand.service'
import { toast } from 'react-hot-toast'

const BrandSelect = ({ control, name = 'brand', error }) => {
  const {
    data: brandsResponse,
    isLoading,
    isError,
    error: brandsError,
  } = useGetBrandsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  // Transform brands data with error handling
  const brands = React.useMemo(() => {
    try {
      if (!brandsResponse?.data) return []

      return brandsResponse.data
        .filter(brand => brand && (brand._id || brand.id)) // Ensure brand has an ID
        .map(brand => ({
          id: brand._id || brand.id,
          name: brand.name || 'Unknown Brand',
          logo: brand.logo || null,
        }))
    } catch (error) {
      console.error('Error processing brands:', error)
      return []
    }
  }, [brandsResponse])

  if (isError) {
    console.error('Error fetching brands:', brandsError)
  }

  return (
    <div className="space-y-2">
      <label className="text-field__label">Brand</label>
      <Controller
        name={name}
        control={control}
        rules={{ required: 'Brand is required' }}
        render={({ field }) => (
          <select
            {...field}
            className={`text-field w-full ${error ? 'border-red-500' : ''}`}
            disabled={isLoading}
          >
            <option value="">Select a brand</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isError && <p className="text-sm text-red-500">Error loading brands</p>}
    </div>
  )
}

export default BrandSelect
