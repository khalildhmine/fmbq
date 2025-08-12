'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { X, Upload, Loader2, Palette } from 'lucide-react'
import { useCreateBrandMutation } from '@/store/services/brand.service'

const AddBrandModal = ({ isOpen, onClose, onBrandCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    color: '#000000',
    active: true,
    featured: false,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Generate slug from name
  React.useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      }))
    }
  }, [formData.name])

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
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
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

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }

    if (!formData.logo) {
      toast.error('Logo is required')
      return
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.toLowerCase().trim(),
        description: formData.description?.trim() || '',
        logo: formData.logo,
        color: formData.color || '#000000',
        active: formData.active ?? true,
        featured: formData.featured ?? false,
      }

      const result = await createBrand({ body: payload }).unwrap()
      toast.success('Brand created successfully')

      // Call the callback with the new brand
      if (onBrandCreated) {
        onBrandCreated(result.data)
      }

      // Reset form and close modal
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        color: '#000000',
        active: true,
        featured: false,
      })
      setImagePreview(null)
      onClose()
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error(error?.data?.message || error?.message || 'Failed to create brand')
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      color: '#000000',
      active: true,
      featured: false,
    })
    setImagePreview(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Brand</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new brand for your products</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="brand-name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter brand description"
                />
              </div>
            </div>

            {/* Visual Elements */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Logo <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Brand logo preview"
                        className="w-32 h-32 object-contain border rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData(prev => ({ ...prev, logo: '' }))
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
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
                      id="brand-logo-upload"
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-5 h-5 mr-2" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    pattern="^#([A-Fa-f0-9]{6})$"
                    placeholder="#000000"
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e =>
                      handleChange({ target: { name: 'color', value: e.target.value } })
                    }
                    className="h-12 w-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                </div>
                <div
                  className="mt-2 p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: formData.color,
                    color: getTextColor(formData.color),
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  Color Preview
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Featured</label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || uploading || !formData.logo}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper function to determine text color based on background
function getTextColor(hexColor) {
  if (!hexColor || hexColor.length < 7) return '#000000'
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export default AddBrandModal

