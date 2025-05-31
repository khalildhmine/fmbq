'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import DashboardHeader from '@/components/admin/DashboardHeader'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

const types = ['Body', 'House', 'Other']
const concentrations = [
  'Perfume',
  'Eau de Parfum',
  'Eau de Toilette',
  'Eau de Cologne',
  'Eau Fraiche',
]

export default function EditPerfumePage({ params }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ingredients, setIngredients] = useState([''])
  const [features, setFeatures] = useState([''])
  const [additionalImages, setAdditionalImages] = useState([''])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    price: '',
    discount: '0',
    volume: '',
    concentration: '',
    mainImage: '',
    inStock: '0',
  })

  // Fetch perfume data
  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        const response = await fetch(`/api/admin/maison-adrar/${id}`)
        const result = await response.json()

        if (result.success) {
          const perfume = result.data

          // Set form data
          setFormData({
            name: perfume.name || '',
            description: perfume.description || '',
            type: perfume.type ? perfume.type.charAt(0).toUpperCase() + perfume.type.slice(1) : '',
            price: perfume.price?.toString() || '',
            discount: perfume.discount?.toString() || '0',
            volume: perfume.volume || '',
            concentration: perfume.concentration || '',
            mainImage: perfume.mainImage || '',
            inStock: perfume.inStock?.toString() || '0',
          })

          // Set arrays
          setIngredients(perfume.ingredients?.length > 0 ? perfume.ingredients : [''])
          setFeatures(perfume.features?.length > 0 ? perfume.features : [''])
          setAdditionalImages(
            perfume.additionalImages?.length > 0 ? perfume.additionalImages : ['']
          )
        } else {
          toast.error('Failed to fetch perfume data')
          console.error('Error fetching perfume:', result.message)
        }
      } catch (error) {
        toast.error('Failed to fetch perfume data')
        console.error('Error fetching perfume:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfume()
  }, [id])

  // Handle change in form fields
  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle ingredients list
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const removeIngredient = index => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  // Handle features list
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = index => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  // Handle additional images list
  const handleImageChange = (index, value) => {
    const newImages = [...additionalImages]
    newImages[index] = value
    setAdditionalImages(newImages)
  }

  const addImage = () => {
    setAdditionalImages([...additionalImages, ''])
  }

  const removeImage = index => {
    const newImages = [...additionalImages]
    newImages.splice(index, 1)
    setAdditionalImages(newImages)
  }

  // Submit form
  const handleSubmit = async e => {
    e.preventDefault()

    // Validate form
    const requiredFields = [
      'name',
      'type',
      'price',
      'volume',
      'concentration',
      'description',
      'mainImage',
    ]
    const missingFields = requiredFields.filter(field => !formData[field])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Filter out empty values
    const filteredIngredients = ingredients.filter(item => item.trim() !== '')
    const filteredFeatures = features.filter(item => item.trim() !== '')
    const filteredImages = additionalImages.filter(item => item.trim() !== '')

    // Prepare data for submission
    const perfumeData = {
      ...formData,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount),
      inStock: parseInt(formData.inStock),
      ingredients: filteredIngredients,
      features: filteredFeatures,
      additionalImages: filteredImages,
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/maison-adrar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfumeData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Perfume updated successfully')
        router.push('/admin/maison-adrar')
      } else {
        toast.error(data.message || 'Failed to update perfume')
      }
    } catch (error) {
      console.error('Error updating perfume:', error)
      toast.error('Failed to update perfume')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-600">Loading perfume data...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <DashboardHeader title="Edit Perfume" description="Update perfume details" />

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Perfumes
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">Select Type</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (ml) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concentration <span className="text-red-500">*</span>
                </label>
                <select
                  name="concentration"
                  value={formData.concentration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">Select Concentration</option>
                  {concentrations.map(concentration => (
                    <option key={concentration} value={concentration}>
                      {concentration}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
                <input
                  type="number"
                  name="inStock"
                  value={formData.inStock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          {/* Images Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Images</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formData.mainImage && (
                <div className="mt-2">
                  <Image
                    src={formData.mainImage}
                    alt="Main preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = '/placeholder.png'
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images
              </label>
              {additionalImages.map((image, index) => (
                <div key={index} className="flex items-start mb-2">
                  <input
                    type="text"
                    value={image}
                    onChange={e => handleImageChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                    placeholder="Image URL"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-500 hover:text-red-700 px-3 py-2"
                  >
                    Remove
                  </button>
                  {image && (
                    <div className="ml-2">
                      <Image
                        src={image}
                        alt={`Preview ${index}`}
                        width={50}
                        height={50}
                        className="object-cover rounded-md"
                        onError={e => {
                          e.target.onerror = null
                          e.target.src = '/placeholder.png'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="text-indigo-600 hover:text-indigo-800 mt-2"
              >
                + Add Image
              </button>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Ingredients</h3>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={e => handleIngredientChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                  placeholder="Ingredient name"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700 px-3 py-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="text-indigo-600 hover:text-indigo-800"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Features Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Features</h3>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={e => handleFeatureChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-500 hover:text-red-700 px-3 py-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-indigo-600 hover:text-indigo-800"
            >
              + Add Feature
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Updating...' : 'Update Perfume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
