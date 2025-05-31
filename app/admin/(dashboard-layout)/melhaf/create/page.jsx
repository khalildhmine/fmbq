'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateMelhafPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])

  // Handle image upload
  const handleImageUpload = async e => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const uploadPromises = files.map(async file => {
        // First get the upload signature from our API
        const uploadUrlRes = await fetch('http://192.168.100.3:3000/api/upload/get-upload-url', {
          method: 'POST',
        })

        if (!uploadUrlRes.ok) throw new Error('Failed to get upload signature')

        const { url, fields } = await uploadUrlRes.json()

        // Prepare form data for Cloudinary
        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value)
        })
        formData.append('file', file)

        // Upload directly to Cloudinary
        const uploadRes = await fetch(url, {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('Failed to upload image')

        const uploadedData = await uploadRes.json()

        return {
          url: uploadedData.secure_url,
          public_id: uploadedData.public_id,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedImages])
      toast.success('Images uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  // Remove image
  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Form submission with image URLs
  const onSubmit = async data => {
    try {
      setLoading(true)

      const formData = {
        ...data,
        images,
      }

      const res = await fetch('/api/admin/melhaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create melhaf')

      toast.success('Melhaf created successfully')
      router.push('/admin/melhaf')
    } catch (error) {
      console.error(error)
      toast.error('Failed to create melhaf')
    } finally {
      setLoading(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      type: 'Persi',
      specifications: [{ title: '', value: '' }],
      sizes: [{ size: '', inStock: 0 }],
    },
  })

  const melhafType = watch('type')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Melhaf</h1>
        <p className="text-gray-600 mt-1">Add a new melhaf to your collection</p>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (MRU)</label>
            <input
              type="number"
              {...register('price', { required: 'Price is required', min: 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
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

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => reset()}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Melhaf'}
          </button>
        </div>
      </form>
    </div>
  )
}
