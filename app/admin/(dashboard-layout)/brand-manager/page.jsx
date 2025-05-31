'use client'

import { useState, useEffect } from 'react'
import { useGetBrandsQuery, useCreateBrandMutation } from '@/store/services/brand.service'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Loader, Plus, Grid, Settings } from 'lucide-react'

const BrandManager = () => {
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandSlug, setNewBrandSlug] = useState('')
  const [newBrandLogo, setNewBrandLogo] = useState('')
  const [newBrandColor, setNewBrandColor] = useState('#F5F5DC')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const { data: brands, isLoading, isError, error } = useGetBrandsQuery()
  const [createBrand] = useCreateBrandMutation()

  // Generate slug from name
  useEffect(() => {
    if (newBrandName) {
      setNewBrandSlug(
        newBrandName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      )
    }
  }, [newBrandName])

  const handleAddBrand = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!newBrandLogo) {
      toast.error('Please upload a brand logo')
      setIsSubmitting(false)
      return
    }

    try {
      await createBrand({
        body: {
          name: newBrandName,
          slug: newBrandSlug,
          logo: newBrandLogo,
          color: newBrandColor,
          featured: false,
          active: true,
        },
      }).unwrap()

      toast.success('Brand added successfully!')
      setNewBrandName('')
      setNewBrandSlug('')
      setNewBrandLogo('')
      setNewBrandColor('#F5F5DC')
      setImagePreview(null)
    } catch (error) {
      console.error('Error adding brand:', error)
      toast.error(error.message || 'Failed to add brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

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
      setNewBrandLogo(data.url) // Set the actual uploaded image URL
      setImagePreview(data.url) // Use the actual URL for preview
      toast.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setNewBrandLogo('')
    setImagePreview(null)
  }

  const getTextColor = hexColor => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading brands...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error loading brands: {error?.message || 'Unknown error'}</p>
      </div>
    )
  }

  const brandsList = brands || []

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="mt-1 text-gray-500">Create and manage your brand portfolio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Add New Brand</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddBrand} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter brand name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand Color</label>
                <input
                  type="color"
                  value={newBrandColor}
                  onChange={e => setNewBrandColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand Logo</label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Brand logo preview"
                        className="w-32 h-32 object-contain border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="w-full"
                    accept="image/*"
                    disabled={uploading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || uploading || !newBrandLogo}
                className="w-full py-2 px-4 bg-black text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Brand'}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Existing Brands</h3>
          </div>
          <div className="p-6">
            {brandsList.length === 0 ? (
              <p>No brands found</p>
            ) : (
              <div className="space-y-4">
                {brandsList.map(brand => (
                  <div
                    key={brand._id}
                    className="p-4 border rounded-lg"
                    style={{
                      backgroundColor: brand.color || '#F5F5DC',
                      color: getTextColor(brand.color || '#F5F5DC'),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={brand.logo || 'https://via.placeholder.com/40'}
                          alt={brand.name}
                          className="w-10 h-10 rounded-full object-contain bg-white"
                        />
                        <span className="font-medium">{brand.name}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/brand-manager/edit/${brand._id}`)}
                        className="px-3 py-1 bg-white text-gray-700 rounded-md shadow-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandManager
