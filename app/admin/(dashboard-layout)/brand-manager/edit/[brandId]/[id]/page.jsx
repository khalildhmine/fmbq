'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Upload, X, Loader } from 'lucide-react'
import { useGetBrandsQuery, useUpdateBrandMutation } from '@/store/services/brand.service'
import PageContainer from '@/components/common/PageContainer'
import BigLoading from '@/components/common/BigLoading'

const EditBrandPage = () => {
  const router = useRouter()
  const { id } = useParams()

  // States
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    color: '#F5F5DC',
    featured: false,
    isInFeed: true,
    active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Fetch brand data
  const { data: brandsData, isLoading } = useGetBrandsQuery()
  const [updateBrand] = useUpdateBrandMutation()

  // Get text color based on background
  const getTextColor = hexColor => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  // Load brand data
  useEffect(() => {
    if (brandsData?.data) {
      const brand = brandsData.data.find(b => b._id === id)
      if (brand) {
        setFormData({
          name: brand.name || '',
          slug: brand.slug || '',
          logo: brand.logo || '',
          description: brand.description || '',
          color: brand.color || '#F5F5DC',
          featured: brand.featured || false,
          isInFeed: brand.isInFeed !== false, // default to true if undefined
          active: brand.active !== false, // default to true if undefined
        })
      }
    }
  }, [brandsData, id])

  // Set initial image preview when brand data loads
  useEffect(() => {
    if (brandsData?.data) {
      const brand = brandsData.data.find(b => b._id === id)
      if (brand?.logo) {
        setImagePreview(brand.logo)
      }
    }
  }, [brandsData, id])

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateBrand({
        id,
        body: formData,
      }).unwrap()

      if (result.success) {
        toast.success('Brand updated successfully!')
        router.push('/admin/brand-manager')
      } else {
        toast.error(result.message || 'Failed to update brand')
      }
    } catch (error) {
      console.error('Error updating brand:', error)
      toast.error(error.message || 'Failed to update brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    // File validation
    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setFormData(prev => ({ ...prev, logo: data.url }))
      setImagePreview(data.url)
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, logo: '' }))
    setImagePreview(null)
  }

  if (isLoading) {
    return (
      <PageContainer title="Edit Brand">
        <div className="flex justify-center py-12">
          <BigLoading />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Edit Brand">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            {/* Replace the logo URL input with image upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Brand Logo</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Brand logo"
                      className="w-32 h-32 object-contain rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Logo</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Brand Color</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  pattern="^#([A-Fa-f0-9]{6})$"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => handleChange({ target: { name: 'color', value: e.target.value } })}
                  className="mt-1 h-9 w-9 rounded cursor-pointer border border-gray-300"
                />
              </div>
              <div
                className="mt-2 p-3 rounded transition-all"
                style={{
                  backgroundColor: formData.color,
                  color: getTextColor(formData.color),
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <span className="text-sm font-medium">Color Preview</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Brand</span>
              </label>

              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="isInFeed"
                  checked={formData.isInFeed}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show in Feed</span>
              </label>

              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/brand-manager')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  )
}

export default EditBrandPage
