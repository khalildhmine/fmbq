import React, { useState, useEffect } from 'react'

const CategoryManager = () => {
  // State
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      } else {
        setError(data.message || 'Error loading categories')
      }
    } catch (err) {
      setError('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Simplified render method
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Category Manager</h3>
        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading categories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="space-y-4">
          {categories.slice(0, 5).map(category => (
            <div key={category._id} className="border p-4 rounded">
              <p className="font-medium">{category.name}</p>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          ))}
          {categories.length > 5 && (
            <p className="text-sm text-gray-500 text-center">
              Showing 5 of {categories.length} categories
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No categories found</p>
        </div>
      )}
    </div>
  )
}

export default CategoryManager
