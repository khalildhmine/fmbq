'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import PageContainer from '@/components/common/PageContainer'
import { toast } from 'react-hot-toast'
import { FiArrowLeft, FiSave, FiTrash2, FiCode } from 'react-icons/fi'
import Link from 'next/link'
import BigLoading from '@/components/common/BigLoading'

const EditCategoryPage = () => {
  const router = useRouter()
  const { id } = useParams()

  // States
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    level: 0,
    parent: null,
    image: '',
    colors: { primary: '#000000', secondary: '#ffffff' },
    active: true,
    featured: false,
  })
  const [parentCategories, setParentCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [jsonError, setJsonError] = useState(null)

  // Level names for better UI display
  const levelNames = {
    0: 'Main Category',
    1: 'Subcategory',
    2: 'Type',
  }

  // Example names for each level
  const exampleNames = {
    0: 'Women, Men, Kids, Home, Beauty',
    1: 'Dresses, Tops, Pants, Shoes, Accessories',
    2: 'Casual, Party, Office, Seasonal',
  }

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/category/${id}`)
        const data = await response.json()

        if (data.success && data.data) {
          setFormData({
            name: data.data.name || '',
            slug: data.data.slug || '',
            level: data.data.level || 0,
            parent: data.data.parent || null,
            image: data.data.image || '',
            colors: data.data.colors || { primary: '#000000', secondary: '#ffffff' },
            active: data.data.active !== undefined ? data.data.active : true,
            featured: data.data.featured || false,
          })
        } else {
          setError(data.message || 'Failed to fetch category')
          toast.error(data.message || 'Failed to fetch category')
        }
      } catch (err) {
        console.error('Error fetching category:', err)
        setError('Failed to fetch category')
        toast.error('Failed to fetch category')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  // Convert form data to JSON string when switching to JSON mode
  useEffect(() => {
    if (jsonMode) {
      setJsonData(JSON.stringify(formData, null, 2))
    }
  }, [jsonMode, formData])

  // Fetch parent categories based on the level
  useEffect(() => {
    if (formData.level > 0) {
      const fetchParentCategories = async () => {
        try {
          const parentLevel = formData.level - 1
          const response = await fetch(`/api/category?level=${parentLevel}`)
          const data = await response.json()

          if (data.success && data.data) {
            setParentCategories(data.data)
          } else {
            console.error('Failed to fetch parent categories')
          }
        } catch (err) {
          console.error('Error fetching parent categories:', err)
        }
      }

      fetchParentCategories()
    } else {
      setParentCategories([])
    }
  }, [formData.level])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, formData.slug])

  const handleChange = e => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'parent' && value === '' ? null : value,
      }))
    }
  }

  const handleJsonChange = e => {
    setJsonData(e.target.value)
    setJsonError(null)

    // Try to parse the JSON to validate it
    try {
      JSON.parse(e.target.value)
    } catch (err) {
      setJsonError('Invalid JSON: ' + err.message)
    }
  }

  const applyJsonChanges = () => {
    try {
      const newData = JSON.parse(jsonData)

      // Basic validation
      if (typeof newData !== 'object') {
        throw new Error('JSON must represent an object')
      }

      // Apply changes to formData
      setFormData(newData)

      // Exit JSON mode
      setJsonMode(false)
      setJsonError(null)
      toast.success('JSON changes applied')
    } catch (err) {
      setJsonError('Error applying changes: ' + err.message)
      toast.error('Invalid JSON format')
    }
  }

  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Retrieve upload token
      const tokenResponse = await fetch('/api/upload/getToken')
      const tokenData = await tokenResponse.json()

      if (!tokenData.success) {
        throw new Error(tokenData.message || 'Failed to retrieve upload token')
      }

      const { signature, timestamp, cloudName, apiKey } = tokenData.data

      // Upload image to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', 'products')

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const uploadData = await uploadResponse.json()

      if (uploadData.secure_url) {
        setFormData(prev => ({ ...prev, image: uploadData.secure_url }))
        toast.success('Image uploaded successfully')
      } else {
        throw new Error('Failed to upload image: No URL returned')
      }
    } catch (error) {
      console.error('Error during image upload:', error)
      setError(`Image upload failed: ${error.message}`)
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async e => {
    if (e) e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.image) {
        throw new Error('Please fill all required fields')
      }

      const response = await fetch(`/api/category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category updated successfully')
        router.push('/admin/categories')
      } else {
        throw new Error(data.message || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/category/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category deleted successfully')
        router.push('/admin/categories')
      } else {
        throw new Error(data.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setSubmitting(false)
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <PageContainer title="Edit Category">
        <div className="flex justify-center py-12"></div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Edit Category">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/categories"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-1" /> Back to Categories
        </Link>

        <button
          onClick={() => setJsonMode(!jsonMode)}
          className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        >
          <FiCode className="mr-1" /> {jsonMode ? 'Form Mode' : 'JSON Mode'}
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">Editing {levelNames[formData.level]}</h3>
        <p className="text-blue-600 text-sm">
          {formData.level === 0 && 'Main categories are top-level groups like Women, Men, Kids.'}
          {formData.level === 1 &&
            'Subcategories group related products like Dresses, Tops, Pants.'}
          {formData.level === 2 && 'Types add further classification like Casual, Formal, Party.'}
        </p>
      </div>

      {jsonMode ? (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit Category as JSON
            </label>
            <textarea
              value={jsonData}
              onChange={handleJsonChange}
              className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-md shadow-inner"
              spellCheck="false"
            />
            {jsonError && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-sm">{jsonError}</div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 flex items-center rounded-lg 
                ${
                  deleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
            >
              <FiTrash2 className="mr-2" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete Category'}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setJsonMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyJsonChanges}
                disabled={!!jsonError}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
              >
                Apply JSON Changes
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !!jsonError}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center"
              >
                <FiSave className="mr-2" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={`Enter ${levelNames[formData.level]} name`}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Slug field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Auto-generated from name, used in URLs</p>
              </div>

              {/* Parent category field (if level > 0) */}
              {formData.level > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent Category *
                  </label>
                  <select
                    name="parent"
                    value={formData.parent || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Select parent category
                    </option>
                    {parentCategories.map(parent => (
                      <option key={parent._id} value={parent._id}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                  {parentCategories.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      No parent categories available. Please create a{' '}
                      {formData.level === 1
                        ? 'main category'
                        : `level ${formData.level - 1} category`}{' '}
                      first.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Image *</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Change Image'}
                  </label>
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Category"
                      className="ml-4 h-16 w-16 rounded-md object-cover border"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Recommended: 600x400px, max 1MB</p>
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Category
                </label>
              </div>

              {/* Active checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active Category
                </label>
              </div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 flex items-center rounded-lg 
                ${
                  deleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
            >
              <FiTrash2 className="mr-2" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete Category'}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/categories')}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center"
              >
                <FiSave className="mr-2" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </PageContainer>
  )
}

export default EditCategoryPage
