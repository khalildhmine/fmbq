'use client'

import { useState, useEffect } from 'react'
import { useGetBrandsQuery, useCreateBrandMutation } from '@/store/services/brand.service'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Loader, Plus, Grid, Settings } from 'lucide-react'
import PageContainer from '@/components/common/PageContainer'

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
      <div className="w-12 h-12 border-4 border-black rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
    </div>
    <p className="text-gray-600">Loading brands...</p>
  </div>
)

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 text-center">{message}</p>
    </div>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
    >
      Try Again
    </button>
  </div>
)

const BrandManager = () => {
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandSlug, setNewBrandSlug] = useState('')
  const [newBrandLogo, setNewBrandLogo] = useState('')
  const [newBrandColor, setNewBrandColor] = useState('#F5F5DC')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const {
    data: brandsList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBrandsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

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
        name: newBrandName,
        slug: newBrandSlug,
        logo: newBrandLogo,
        color: newBrandColor,
        featured: false,
        active: true,
      }).unwrap()

      toast.success('Brand added successfully!')
      setNewBrandName('')
      setNewBrandSlug('')
      setNewBrandLogo('')
      setNewBrandColor('#F5F5DC')
      setImagePreview(null)
      refetch() // Refresh the brands list
    } catch (err) {
      console.error('Error adding brand:', err)
      toast.error(err?.data?.message || 'Failed to add brand')
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

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setNewBrandLogo(data.url)
      setImagePreview(data.url)
      toast.success('Logo uploaded successfully')
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setNewBrandLogo('')
    setImagePreview(null)
  }

  const getTextColor = hexColor => {
    if (!hexColor || hexColor.length < 7) return '#000000'
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const router = useRouter()

  return (
    <PageContainer title="Brand Management">
      <div className="max-w-screen-xl mx-auto">
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
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
                    className="w-full h-10 rounded-md cursor-pointer"
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
                          className="w-32 h-32 object-contain border rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={uploading}
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {uploading ? (
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-5 h-5 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || uploading || !newBrandLogo}
                  className="w-full py-2 px-4 bg-black text-white rounded-md disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Brand'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Existing Brands</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner />
              ) : isError ? (
                <ErrorDisplay message={error?.data?.message || 'Failed to load brands'} />
              ) : brandsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No brands found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {brandsList.map(brand => (
                    <div
                      key={brand._id}
                      className="p-4 border rounded-lg transition-transform hover:scale-[1.02]"
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
                          <div>
                            <span className="font-medium">{brand.name}</span>
                            {brand.description && (
                              <p className="text-sm opacity-75">{brand.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/admin/brand-manager/edit/${brand._id}`)}
                          className="p-2 hover:bg-black/10 rounded-full transition-colors"
                        >
                          <Settings size={20} />
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
    </PageContainer>
  )
}

export default BrandManager
