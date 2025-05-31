'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Upload, X, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditMelhafPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const melhafType = watch('type')

  // Fetch existing melhaf data
  useEffect(() => {
    const fetchMelhaf = async () => {
      try {
        const res = await fetch(`/api/admin/melhaf/${id}`)
        if (!res.ok) throw new Error('Failed to fetch melhaf')

        const data = await res.json()
        if (!data.success) throw new Error(data.message)

        const melhaf = data.data
        reset({
          title: melhaf.title,
          description: melhaf.description,
          type: melhaf.type,
          price: melhaf.price,
          sizes: melhaf.sizes || [],
          promotion: {
            isActive: melhaf.promotion?.isActive || false,
            discountType: melhaf.promotion?.discountType || 'percentage',
            discountValue: melhaf.promotion?.discountValue || 0,
            startDate: melhaf.promotion?.startDate
              ? new Date(melhaf.promotion.startDate).toISOString().slice(0, 16)
              : '',
            endDate: melhaf.promotion?.endDate
              ? new Date(melhaf.promotion.endDate).toISOString().slice(0, 16)
              : '',
          },
        })
        setImages(melhaf.images || [])
      } catch (error) {
        console.error('Error fetching melhaf:', error)
        toast.error('Failed to load melhaf data')
        router.push('/admin/melhaf')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchMelhaf()
  }, [id, reset, router])

  // Handle image upload
  const handleImageUpload = async e => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const uploadPromises = files.map(async file => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Upload failed')
        }

        const data = await res.json()
        return {
          url: data.url,
          public_id: data.public_id,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedImages])
      toast.success(`${files.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // Handle image removal
  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const onSubmit = async data => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/melhaf/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images }),
      })

      if (!res.ok) throw new Error('Failed to update melhaf')

      toast.success('Melhaf updated successfully')
      router.push('/admin/melhaf')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update melhaf')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Melhaf</h1>
        <p className="text-gray-600 mt-1">Update melhaf details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-medium">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                {...register('type')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Persi">Persi</option>
                <option value="Japan">Japan</option>
                <option value="Diana London">Diana London</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (MRU)</label>
            <input
              type="number"
              {...register('price', { required: 'Price is required', min: 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-medium">Images</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
            </label>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Sizes</h2>
          <div className="space-y-4">
            {melhafType === 'Diana London' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size 1</label>
                    <input
                      type="text"
                      {...register('sizes.0.size')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      {...register('sizes.0.inStock')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size 2</label>
                    <input
                      type="text"
                      {...register('sizes.1.size')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      {...register('sizes.1.inStock')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    type="text"
                    {...register('sizes.0.size')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    {...register('sizes.0.inStock')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Promotion Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Promotion Settings</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('promotion.isActive')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Type</label>
              <select
                {...register('promotion.discountType')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (MRU)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Value</label>
              <input
                type="number"
                {...register('promotion.discountValue', {
                  min: 0,
                  max: watch('promotion.discountType') === 'percentage' ? 100 : undefined,
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                {...register('promotion.startDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                {...register('promotion.endDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {watch('promotion.isActive') && watch('promotion.discountValue') > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Final Price after discount:
                <span className="ml-2 font-medium text-green-600">
                  MRU{' '}
                  {calculateFinalPrice(
                    watch('price') || 0,
                    watch('promotion.discountType'),
                    watch('promotion.discountValue')
                  ).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/melhaf')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Helper function to calculate final price
function calculateFinalPrice(price, discountType, discountValue) {
  if (discountType === 'percentage') {
    return price * (1 - discountValue / 100)
  }
  return Math.max(0, price - discountValue)
}
