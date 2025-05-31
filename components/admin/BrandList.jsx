'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useGetBrandsQuery, useDeleteBrandMutation } from '@/store/services/brand.service'
import PageContainer from '@/components/common/PageContainer'
import BigLoading from '@/components/common/BigLoading'

const BrandList = () => {
  const router = useRouter()

  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBrands, setFilteredBrands] = useState([])
  const [deleteBrand] = useDeleteBrandMutation()

  // Fetch brands data
  const { data: brandsData, isLoading } = useGetBrandsQuery()

  // Filter brands based on search term
  useEffect(() => {
    if (brandsData?.data) {
      setFilteredBrands(
        brandsData.data.filter(brand => brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
  }, [brandsData, searchTerm])

  const handleEdit = brandId => {
    router.push(`/admin/brand-manager/edit/${brandId}`)
  }

  const handleDelete = async brandId => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        const result = await deleteBrand(brandId).unwrap()
        toast.success('Brand deleted successfully')
      } catch (error) {
        toast.error('Failed to delete brand')
      }
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Brand Manager">
        <div className="flex justify-center py-12">
          <BigLoading />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Brand Manager">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Brand Manager</h1>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/admin/brand-manager/create')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Brand
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="block w-full px-4 py-2 text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map(brand => (
                <tr key={brand._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{brand.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-cover" />
                    ) : (
                      <div className="text-sm text-gray-500">No logo uploaded</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brand._id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}

export default BrandList
