'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiArrowLeft, FiCode, FiLayers } from 'react-icons/fi'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

// Dynamically import components that might use client-side hooks
const DynamicPageContainer = dynamic(() => import('@/components/common/PageContainer'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  ),
})

// Separate the inner component that uses useSearchParams
const CreateCategoryContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get level and parent_id from URL if they exist
  const initialLevel = searchParams?.get('level') ? parseInt(searchParams.get('level')) : 0
  const initialParentId = searchParams?.get('parent_id') || null

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    level: initialLevel,
    parent: initialParentId,
    image: '',
    colors: { primary: '#000000', secondary: '#ffffff' },
    active: true,
    featured: false,
  })

  const [parentCategories, setParentCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [jsonError, setJsonError] = useState(null)
  const [batchMode, setBatchMode] = useState(false)
  const [parentCategory, setParentCategory] = useState(null)

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

  // Fetch parent categories based on the selected level
  useEffect(() => {
    if (formData.level > 0) {
      // Only fetch parent categories if we're not at level 0
      const parentLevel = formData.level - 1
      console.log(`Fetching parent categories for level ${parentLevel}`)

      fetch(`/api/category?level=${parentLevel}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            console.log(`Fetched ${data.data.length} parent categories`)
            setParentCategories(data.data)

            // If there's an initial parent ID and it's valid, keep it
            if (initialParentId && data.data.some(cat => cat._id === initialParentId)) {
              const selectedParent = data.data.find(cat => cat._id === initialParentId)
              setParentCategory(selectedParent)
              setFormData(prev => ({ ...prev, parent: initialParentId }))
            } else if (data.data.length > 0) {
              // Otherwise, select the first one as default
              setParentCategory(data.data[0])
              setFormData(prev => ({ ...prev, parent: data.data[0]._id }))
            }
          } else {
            console.error('Failed to fetch parent categories:', data.message || 'Unknown error')
            setError('Failed to fetch parent categories')
          }
        })
        .catch(err => {
          console.error('Error fetching parent categories:', err)
          setError('Failed to fetch parent categories')
        })
    } else {
      // For level 0, there are no parent categories
      setParentCategories([])
      setParentCategory(null)
      setFormData(prev => ({ ...prev, parent: null }))
    }
  }, [formData.level, initialParentId])

  // Convert form data to JSON string when switching to JSON mode
  useEffect(() => {
    if (jsonMode) {
      if (batchMode && formData.level > 0) {
        // Create a template for multiple categories
        const baseCategory = {
          level: formData.level,
          parent: formData.parent, // Keep the parent ID
          colors: { primary: '#000000', secondary: '#ffffff' },
          active: true,
          featured: false,
        }

        // Create a more useful template with 4 items for parfumes or generic subcategories
        const templateCategories = [
          {
            ...baseCategory,
            name: "Men's Fragrance",
            slug: 'mens-fragrance',
            image:
              'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/mens-fragrance',
          },
          {
            ...baseCategory,
            name: "Women's Fragrance",
            slug: 'womens-fragrance',
            image:
              'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/womens-fragrance',
          },
          {
            ...baseCategory,
            name: 'Unisex Fragrance',
            slug: 'unisex-fragrance',
            image:
              'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/unisex-fragrance',
          },
          {
            ...baseCategory,
            name: 'Gift Sets',
            slug: 'gift-sets',
            image:
              'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/fragrance-gift-sets',
          },
        ]

        setJsonData(JSON.stringify(templateCategories, null, 2))
      } else {
        // Single category mode
        setJsonData(JSON.stringify(formData, null, 2))
      }
    }
  }, [jsonMode, formData, batchMode])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  const handleChange = e => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'level') {
      // When changing level, reset parent
      const newLevel = parseInt(value)
      setFormData(prev => ({
        ...prev,
        level: newLevel,
        parent: newLevel === 0 ? null : prev.parent,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'parent' && value === '' ? null : value,
      }))

      // Update parent category when parent selection changes
      if (name === 'parent' && value) {
        const selectedParent = parentCategories.find(cat => cat._id === value)
        if (selectedParent) {
          setParentCategory(selectedParent)
        }
      }
    }
  }

  const handleJsonChange = e => {
    setJsonData(e.target.value)
    setJsonError(null)

    // Try to parse the JSON to validate it
    try {
      const parsedData = JSON.parse(e.target.value)

      // Additional validation for batch mode
      if (batchMode) {
        if (!Array.isArray(parsedData)) {
          setJsonError('Batch mode requires an array of category objects')
          return
        }

        if (parsedData.length === 0) {
          setJsonError('Please add at least one category to the array')
          return
        }

        // Validate each category in the array
        const invalidCategories = []
        parsedData.forEach((category, index) => {
          if (!category.name) {
            invalidCategories.push(`Item ${index + 1}: Missing name`)
          }
          if (!category.slug) {
            invalidCategories.push(`Item ${index + 1}: Missing slug`)
          }
          if (!category.image) {
            invalidCategories.push(`Item ${index + 1}: Missing image URL`)
          }
        })

        if (invalidCategories.length > 0) {
          setJsonError(`Please fix the following issues:\n${invalidCategories.join('\n')}`)
        }
      }
    } catch (err) {
      setJsonError('Invalid JSON: ' + err.message)
    }
  }

  const toggleBatchMode = () => {
    setBatchMode(!batchMode)
    // Reset JSON error when toggling modes
    setJsonError(null)
  }

  const applyJsonChanges = () => {
    try {
      const parsedData = JSON.parse(jsonData)

      // Handle batch mode (array of categories)
      if (batchMode) {
        if (!Array.isArray(parsedData)) {
          throw new Error('Batch mode requires an array of category objects')
        }

        // Validate first item in the array
        if (parsedData.length === 0) {
          throw new Error('Please add at least one category to the array')
        }

        // Apply the first item to the form
        const firstItem = parsedData[0]

        // Basic validation
        if (typeof firstItem !== 'object') {
          throw new Error('Each item must be a category object')
        }

        setFormData(firstItem)
        setJsonMode(false)
        setJsonError(null)
        toast.success('Applied first category from batch (others will be created on submit)')
      } else {
        // Single category mode
        if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
          throw new Error('JSON must represent a single category object')
        }

        // Apply changes to formData
        setFormData(parsedData)
        setJsonMode(false)
        setJsonError(null)
        toast.success('JSON changes applied')
      }
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
      // Check if we're in batch mode with JSON data
      if (jsonMode && batchMode) {
        const categories = JSON.parse(jsonData)

        if (!Array.isArray(categories)) {
          throw new Error('Batch data must be an array of category objects')
        }

        // Validate each category
        for (const category of categories) {
          if (!category.name || !category.slug) {
            throw new Error('Each category must have at least a name and slug')
          }
        }

        // Create categories one by one
        const results = []
        let hasErrors = false

        for (const category of categories) {
          const payload = {
            ...category,
            parent: category.parent || formData.parent || null, // Ensure parent is set correctly
          }

          try {
            const response = await fetch('/api/category', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (data.success) {
              results.push({ name: category.name, success: true, message: 'Created successfully' })
            } else {
              results.push({
                name: category.name,
                success: false,
                message: data.message || 'Failed to create',
              })
              hasErrors = true
            }
          } catch (err) {
            results.push({ name: category.name, success: false, message: err.message })
            hasErrors = true
          }
        }

        // Show results
        const successCount = results.filter(r => r.success).length
        const totalCount = results.length

        if (hasErrors) {
          console.error('Batch creation results:', results)
          const failedItems = results
            .filter(r => !r.success)
            .map(r => `${r.name}: ${r.message}`)
            .join(', ')
          toast.error(`Created ${successCount}/${totalCount} items. Failed: ${failedItems}`)
        } else {
          toast.success(`Successfully created ${successCount} categories`)
          router.push('/admin/categories')
        }

        return
      }

      // Standard single category flow
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.image) {
        throw new Error('Please fill all required fields')
      }

      // For levels above 0, parent is required
      if (formData.level > 0 && !formData.parent) {
        throw new Error('Parent category is required for subcategories')
      }

      const payload = {
        ...formData,
        parent: formData.parent || null, // Ensure parent is null for level 0
      }

      console.log('Submitting category data:', payload)

      const response = await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category created successfully')
        router.push('/admin/categories')
      } else {
        throw new Error(data.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Get parent name for display
  const getParentName = () => {
    if (!parentCategory) return null
    return parentCategory.name
  }

  return (
    <DynamicPageContainer title="Create Category">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/categories"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-1" /> Back to Categories
        </Link>

        <div className="flex space-x-2">
          {jsonMode && (
            <button
              onClick={toggleBatchMode}
              className={`flex items-center px-3 py-1 rounded hover:bg-opacity-80 ${
                batchMode
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiLayers className="mr-1" /> {batchMode ? 'Single Mode' : 'Batch Mode'}
            </button>
          )}

          <button
            onClick={() => setJsonMode(!jsonMode)}
            className={`flex items-center px-4 py-2 rounded font-medium ${
              jsonMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <FiCode className="mr-1" /> {jsonMode ? 'Form Mode' : 'JSON Mode'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">
          Creating a {levelNames[formData.level]}
          {parentCategory && formData.level > 0 && (
            <span className="text-blue-600 ml-2">
              under <strong>{getParentName()}</strong>
            </span>
          )}
        </h3>
        <p className="text-blue-600 text-sm">
          {formData.level === 0 && 'Main categories are top-level groups like Women, Men, Kids.'}
          {formData.level === 1 &&
            'Subcategories group related products like Dresses, Tops, Pants.'}
          {formData.level === 2 && 'Types add further classification like Casual, Formal, Party.'}
        </p>
        <div className="text-blue-600 text-sm mt-1">Examples: {exampleNames[formData.level]}</div>

        {jsonMode && (
          <div
            className={`mt-2 p-2 rounded border ${
              batchMode
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <strong>{batchMode ? 'Batch Mode:' : 'JSON Mode:'}</strong>
            {batchMode
              ? ` Create multiple ${levelNames[
                  formData.level
                ].toLowerCase()}s at once by editing the JSON array`
              : ` Edit a single ${levelNames[formData.level].toLowerCase()} in JSON format`}
          </div>
        )}
      </div>

      {jsonMode ? (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {batchMode
                ? `Edit Multiple ${levelNames[formData.level]}s as JSON Array`
                : 'Edit Category as JSON'}
            </label>
            <textarea
              value={jsonData}
              onChange={handleJsonChange}
              className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-md shadow-inner"
              spellCheck="false"
            />
            {jsonError && (
              <div className="mt-2 p-3 bg-red-50 text-red-600 rounded text-sm border border-red-200">
                <p className="font-medium">Validation Error:</p>
                {jsonError.includes('\n') ? (
                  <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                    {jsonError
                      .split('\n')
                      .filter(line => line.trim() !== 'Please fix the following issues:')
                      .map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                  </ul>
                ) : (
                  <p>{jsonError}</p>
                )}
              </div>
            )}

            {batchMode && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium">
                  Each object in the array will be created as a separate category under the same
                  parent.
                </p>
                <p>
                  Required fields: <code className="bg-gray-100 px-1 rounded">name</code>,{' '}
                  <code className="bg-gray-100 px-1 rounded">slug</code>,{' '}
                  <code className="bg-gray-100 px-1 rounded">image</code> (URL)
                </p>
                <div className="mt-2 bg-blue-50 p-3 border border-blue-100 rounded text-blue-700">
                  <p className="font-medium">Tips:</p>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Make sure image URLs are valid (use cloudinary or other hosted images)</li>
                    <li>Each subcategory will use the current parent category automatically</li>
                    <li>Customize colors, featured status, and active status as needed</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setJsonMode(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <div className="flex space-x-4">
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
                className={`px-6 py-2 rounded-lg ${
                  batchMode
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                } text-white font-medium shadow-sm`}
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : batchMode ? (
                  <span>Create {JSON.parse(jsonData || '[]').length || 0} Categories</span>
                ) : (
                  <span>Create Category from JSON</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Category Type field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Type *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>{levelNames[0]}</option>
                  <option value={1}>{levelNames[1]}</option>
                  <option value={2}>{levelNames[2]}</option>
                </select>
              </div>

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
                <p className="mt-1 text-xs text-gray-500">
                  Auto-generated from name, you can edit if needed
                </p>
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
                    {uploading ? 'Uploading...' : 'Upload Image'}
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

          {/* Submit button */}
          <div className="flex justify-end space-x-4">
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      )}
    </DynamicPageContainer>
  )
}

// Wrap the content in Suspense
const CreateCategoryPage = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateCategoryContent />
      </Suspense>
    </DashboardLayout>
  )
}

export default CreateCategoryPage
